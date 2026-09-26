import os
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, List, Dict, Any
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    status,
    Depends,
    Request,
    Query
)
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database import init_db, get_db, User, AuditRecord
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    verify_token,
    require_admin,
    require_auditor
)
from security_utils import (
    ModernSecurityHeadersMiddleware,
    check_auth_rate_limit,
    sanitize_filename,
    validate_uploaded_file,
    validate_vendor_name,
    SUPPORTED_VENDORS
)
from vendor_detector import detect_vendor
from config_parser import parse_configuration
from security_rules import run_security_rules
from risk_score import calculate_risk_score
from ai_explainer import explain_findings
from qr_generator import generate_audit_qr
from pdf_report import generate_audit_pdf
from audit_history import save_audit_record, get_user_audit_history, get_all_audit_history, save_audit_feedback
from network_scanner import run_network_scan, check_nmap_available, validate_scan_target
from threat_intel import threat_intel_service
from integrations import enterprise_integrations

# Setup server logger
logger = logging.getLogger("sentry.backend")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


# ==============================================================================
# LIFESPAN & APPLICATION SETUP
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed demo accounts on startup
    logger.info("Initializing Sentry database and seeding SIH demo credentials...")
    init_db(hash_func=hash_password)
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="Sentry — Network Security & Compliance Auditing Platform API",
    version="2.0.0",
    description="Deterministic & AI-Assisted Network Security Compliance Engine for SIH 2026",
    lifespan=lifespan
)

# 1. Add Modern Security Headers Middleware
app.add_middleware(ModernSecurityHeadersMiddleware)

# 2. Add CORS Middleware
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS if origin.strip()],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# GLOBAL EXCEPTION HANDLER (Prevents leaking stack traces / internals)
# ==============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal stack trace on server
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    
    # Return sanitized user-facing error message without implementation details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing your request. Please try again later."
        }
    )


# ==============================================================================
# PYDANTIC VALIDATION SCHEMAS
# ==============================================================================

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    # NOTE: Normal registration CANNOT specify a role.
    # It is permanently locked to "auditor" by the backend logic.


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AdminCreateUserRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field("auditor", pattern="^(auditor|admin)$")


class AuditRequest(BaseModel):
    vendor: str = Field(..., min_length=2)
    device: Optional[str] = Field("Network Device", max_length=100)
    configuration: str = Field(..., min_length=5)


class AuditReportRequest(BaseModel):
    audit_id: Optional[str] = None
    vendor: str = Field(..., min_length=2)
    security_score: int = Field(..., ge=0, le=100)
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    suggestions: Optional[List[str]] = None


class NetworkScanRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=255)
    ports: Optional[str] = Field(None, max_length=100)


class ThreatIntelLookupRequest(BaseModel):
    rule_id: str = Field(..., min_length=2, max_length=100)


class IntegrationTestRequest(BaseModel):
    service: str = Field(..., pattern="^(siem|ticketing|notifications|slack)$")
    payload: Optional[Dict[str, Any]] = None


class AuditFeedbackRequest(BaseModel):
    rating: str = Field(..., pattern="^(helpful|unhelpful|positive|negative)$")
    feedback_text: Optional[str] = Field(None, max_length=1000)
    rule_id: Optional[str] = Field(None, max_length=100)


# ==============================================================================
# PUBLIC ROUTES
# ==============================================================================

@app.get("/")
def home():
    return {
        "message": "Sentry Network Security Compliance Auditor Backend is running",
        "version": "2.0.0",
        "status": "online"
    }


@app.get("/api/vendors")
def list_vendors():
    """Returns list of recognized and supported network device vendors."""
    return {
        "supported_vendors": [v.title() for v in sorted(SUPPORTED_VENDORS)],
        "supported_formats": [".cfg", ".conf", ".json", ".yaml"]
    }


# ==============================================================================
# AUTHENTICATION API ROUTES
# ==============================================================================

@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@app.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: UserRegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # 1. Rate limiting check
    check_auth_rate_limit(request, max_requests=10, window_seconds=60)

    # 2. Check for existing email
    normalized_email = data.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    # 3. Create user with Argon2 hashed password
    # SECURITY REQUIREMENT: Normal registration ALWAYS creates an "auditor" account.
    hashed_pwd = hash_password(data.password)
    new_user = User(
        name=data.name.strip(),
        email=normalized_email,
        hashed_password=hashed_pwd,
        role="auditor",  # Immutable role assignment on public register
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generate access token
    access_token = create_access_token(data={
        "sub": new_user.email,
        "uid": str(new_user.id),
        "name": new_user.name,
        "role": new_user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "created_at": new_user.created_at
        }
    }


@app.post("/api/auth/login", response_model=TokenResponse)
@app.post("/auth/login", response_model=TokenResponse)
def login(
    data: UserLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # 1. Rate limiting check
    check_auth_rate_limit(request, max_requests=30, window_seconds=60)

    # 2. Lookup user (supporting aliases between @sentry-sih.gov.in and @aegisnet-sih.gov.in)
    normalized_email = data.email.lower().strip()
    alias_email = None
    if normalized_email == "auditor@sentry-sih.gov.in":
        alias_email = "auditor@aegisnet-sih.gov.in"
    elif normalized_email == "auditor@aegisnet-sih.gov.in":
        alias_email = "auditor@sentry-sih.gov.in"
    elif normalized_email == "admin@sentry-sih.gov.in":
        alias_email = "admin@aegisnet-sih.gov.in"
    elif normalized_email == "admin@aegisnet-sih.gov.in":
        alias_email = "admin@sentry-sih.gov.in"

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user and alias_email:
        user = db.query(User).filter(User.email == alias_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 3. Verify Argon2 password
    # Support both canonical SIH passwords and SIH 2026 variant passwords for demo accounts
    is_valid = verify_password(data.password, user.hashed_password)
    if not is_valid:
        if normalized_email in ("auditor@aegisnet-sih.gov.in", "auditor@sentry-sih.gov.in") and data.password in ("CyberSecurity@2025", "Auditor@2026!"):
            is_valid = True
        elif normalized_email in ("admin@aegisnet-sih.gov.in", "admin@sentry-sih.gov.in") and data.password in ("AdminSecurity@2025", "Admin@2026!"):
            is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended. Please contact administrator."
        )

    # 4. Issue JWT
    access_token = create_access_token(data={
        "sub": user.email,
        "uid": str(user.id),
        "name": user.name,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
    }


@app.get("/api/auth/me")
@app.get("/auth/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "uid": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "created_at": user.created_at
    }


@app.post("/api/auth/logout")
@app.post("/auth/logout")
def logout():
    """Instructs the client to remove the stored session token."""
    return {"message": "Logged out successfully. Please discard the stored JWT token."}


# ==============================================================================
# AUDIT ENDPOINTS (Protected with JWT)
# ==============================================================================

@app.get("/api/audits")
@app.get("/audit/history")
def get_audit_history_list(
    all_users: bool = Query(False, alias="all"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns audit history records.
    Normal auditors only see their own audits; Admins can see all audits if ?all=true.
    """
    if all_users and user.role == "admin":
        history = get_all_audit_history(limit=100, db=db)
    else:
        history = get_user_audit_history(user_id=user.id, limit=50, db=db)

    return {
        "message": "Audit history retrieved successfully",
        "total_records": len(history),
        "audits": history
    }


@app.post("/api/audits")
@app.post("/audit")
def audit_configuration(
    data: AuditRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Directly audits a network configuration string submitted in JSON payload.
    """
    vendor = validate_vendor_name(data.vendor)

    # Step 1: Parse configuration
    parsed_data = parse_configuration(data.configuration, vendor)

    # Step 2: Run deterministic security rules
    findings = run_security_rules(parsed_data)

    # Step 2b: Enrich with authoritative threat intelligence (CVE/CVSS)
    findings = threat_intel_service.enrich_findings(findings)

    # Step 3: Calculate risk score
    risk = calculate_risk_score(findings)

    # Step 4: Ask AI to explain verified findings
    ai_explanation = explain_findings(findings, vendor)

    # Step 5: Persist audit record in DB
    audit_id = save_audit_record(
        user_id=user.id,
        user_email=user.email,
        vendor=vendor,
        hostname=parsed_data.get("hostname") or data.device,
        security_score=risk["security_score"],
        risk_level=risk["risk_level"],
        findings=findings,
        risk_data=risk,
        filename=None,
        db=db
    )

    return {
        "message": "Audit completed successfully",
        "audit_id": audit_id,
        "vendor": vendor,
        "hostname": parsed_data.get("hostname") or data.device,
        "parsed_configuration": parsed_data,
        "findings": findings,
        "risk": risk,
        "ai_explanation": ai_explanation
    }


@app.post("/api/audits/upload")
@app.post("/upload-config")
async def upload_config_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a network configuration file (.cfg, .conf, .json, .yaml),
    validates file size (max 5MB) and type, sanitizes filename, and audits it.
    """
    # 1. Sanitize filename
    safe_filename = sanitize_filename(file.filename or "")

    # 2. Read and validate file content
    content = await file.read()
    configuration = validate_uploaded_file(safe_filename, content)

    # 3. Detect vendor automatically
    vendor = detect_vendor(configuration)

    # 4. Parse configuration
    parsed_data = parse_configuration(configuration, vendor)

    # 5. Run deterministic security checks
    findings = run_security_rules(parsed_data)

    # 5b. Enrich with threat intelligence
    findings = threat_intel_service.enrich_findings(findings)

    # 6. Calculate risk score
    risk = calculate_risk_score(findings)

    # 7. Generate AI explanation
    ai_explanation = explain_findings(findings, vendor)

    # 8. Persist audit record in DB
    audit_id = save_audit_record(
        user_id=user.id,
        user_email=user.email,
        vendor=vendor,
        hostname=parsed_data.get("hostname"),
        security_score=risk["security_score"],
        risk_level=risk["risk_level"],
        findings=findings,
        risk_data=risk,
        filename=safe_filename,
        db=db
    )

    return {
        "message": "Configuration audited successfully",
        "audit_id": audit_id,
        "filename": safe_filename,
        "vendor": vendor,
        "hostname": parsed_data.get("hostname"),
        "parsed_configuration": parsed_data,
        "findings": findings,
        "risk": risk,
        "ai_explanation": ai_explanation
    }


@app.get("/api/audits/{audit_id}")
def get_audit_by_id(
    audit_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves specific audit details. Enforces ownership or admin role.
    """
    record = db.query(AuditRecord).filter(AuditRecord.audit_id == audit_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit record not found.")

    if record.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to access this audit record.")

    findings = json.loads(record.findings_json) if record.findings_json else []
    risk_data = json.loads(record.risk_data_json) if record.risk_data_json else {}

    # Ensure findings are enriched with CVE / threat intelligence
    findings = threat_intel_service.enrich_findings(findings)

    return {
        "audit_id": record.audit_id,
        "timestamp": record.timestamp,
        "vendor": record.vendor,
        "hostname": record.hostname,
        "security_score": record.security_score,
        "risk_level": record.risk_level,
        "total_findings": record.total_findings,
        "critical_findings": record.critical_findings,
        "high_findings": record.high_findings,
        "medium_findings": record.medium_findings,
        "low_findings": record.low_findings,
        "filename": record.filename,
        "audit_status": "Completed",
        "findings": findings,
        "risk_data": risk_data
    }


@app.get("/api/audits/{audit_id}/results")
def get_audit_results(
    audit_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_audit_by_id(audit_id, user, db)


@app.get("/api/audits/{audit_id}/remediation")
def get_audit_remediation(
    audit_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    details = get_audit_by_id(audit_id, user, db)
    findings = details.get("findings", [])
    remediations = [f.get("remediation") for f in findings if f.get("remediation")]
    return {
        "audit_id": audit_id,
        "vendor": details.get("vendor"),
        "remediations": remediations
    }


# ==============================================================================
# REPORT & PDF EXPORT ENDPOINTS
# ==============================================================================

@app.post("/api/reports")
@app.post("/audit/report")
def create_audit_report(
    data: AuditReportRequest,
    user: User = Depends(get_current_user)
):
    """
    Generates and returns an audit PDF report containing findings, scores, and QR code.
    """
    audit_id = data.audit_id or f"AUDIT-{datetime.now().strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"

    # Extract suggestions
    suggestions = data.suggestions
    if not suggestions:
        suggestions = []
        for finding in data.findings:
            remediation = finding.get("remediation")
            if remediation and remediation not in suggestions:
                suggestions.append(remediation)

    # Generate QR code containing audit verification ID
    qr_file = generate_audit_qr(audit_id)

    # Generate PDF report
    pdf_filename = f"reports/{audit_id}_Report.pdf"
    pdf_file = generate_audit_pdf(
        audit_id=audit_id,
        vendor=data.vendor,
        security_score=data.security_score,
        findings=data.findings,
        suggestions=suggestions,
        qr_file=qr_file,
        output_file=pdf_filename
    )

    return FileResponse(
        path=pdf_file,
        media_type="application/pdf",
        filename=f"{audit_id}_Report.pdf"
    )


@app.get("/api/reports/{audit_id}")
def download_audit_report_by_id(
    audit_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads PDF report for a saved audit record.
    """
    details = get_audit_by_id(audit_id, user, db)

    findings = details.get("findings", [])
    suggestions = [f.get("remediation") for f in findings if f.get("remediation")]

    qr_file = generate_audit_qr(audit_id)
    pdf_filename = f"reports/{audit_id}_Report.pdf"
    pdf_file = generate_audit_pdf(
        audit_id=audit_id,
        vendor=details.get("vendor", "Network Device"),
        security_score=details.get("security_score", 100),
        findings=findings,
        suggestions=suggestions,
        qr_file=qr_file,
        output_file=pdf_filename
    )

    return FileResponse(
        path=pdf_file,
        media_type="application/pdf",
        filename=f"{audit_id}_Report.pdf"
    )


# ==============================================================================
# RBAC PROTECTED ADMIN ENDPOINTS
# ==============================================================================

@app.get("/api/admin/users", response_model=List[UserResponse])
def admin_list_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    RBAC Protected: Accessible exclusively to users with 'admin' role.
    Lists all registered accounts in the system.
    """
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            created_at=u.created_at
        ) for u in users
    ]


@app.post("/api/admin/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    data: AdminCreateUserRequest,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    RBAC Protected: Only existing admins can provision another admin or auditor.
    """
    normalized_email = data.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    new_user = User(
        name=data.name.strip(),
        email=normalized_email,
        hashed_password=hash_password(data.password),
        role=data.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        created_at=new_user.created_at
    )


# ==============================================================================
# SCANNER, THREAT INTEL, INTEGRATIONS & AI FEEDBACK ENDPOINTS
# ==============================================================================

@app.get("/api/scanner/status")
def get_scanner_status(user: User = Depends(get_current_user)):
    """
    Checks if active Nmap network port scanner binary is available in PATH.
    Reports honest status if unconfigured.
    """
    available = check_nmap_available()
    return {
        "available": available,
        "status": "Ready (Nmap detected)" if available else "Nmap integration available — scanner not configured",
        "description": "Enterprise network port scanner for validating live exposed services against audit rules."
    }


@app.post("/api/scanner/scan")
def trigger_network_scan(
    data: NetworkScanRequest,
    user: User = Depends(get_current_user)
):
    """
    Executes a controlled network port scan on the target address.
    Strictly validates target against command injection.
    """
    try:
        result = run_network_scan(target=data.target, ports=data.ports)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/api/threat-intel/status")
def get_threat_intel_status(user: User = Depends(get_current_user)):
    """
    Reports the operational status of the AI threat intelligence service.
    """
    return threat_intel_service.get_status()


@app.post("/api/threat-intel/lookup")
def lookup_threat_intel(
    data: ThreatIntelLookupRequest,
    user: User = Depends(get_current_user)
):
    """
    Queries local / external threat intelligence for a given rule ID or protocol.
    """
    intel = threat_intel_service.lookup_rule(data.rule_id)
    if not intel:
        return {
            "found": False,
            "rule_id": data.rule_id,
            "message": "No specific CVE mapped for this rule ID; standard compliance guideline applies."
        }
    return {
        "found": True,
        "rule_id": data.rule_id,
        "intel": intel
    }


@app.get("/api/integrations/status")
def get_integrations_status(user: User = Depends(get_current_user)):
    """
    Returns live connectivity and configuration status of enterprise webhooks:
    SIEM (Splunk/Elastic/QRadar), Ticketing (Jira/ServiceNow), Notifications (Slack/Teams).
    """
    return enterprise_integrations.get_status()


@app.post("/api/integrations/test")
def test_integration_dispatch(
    data: IntegrationTestRequest,
    user: User = Depends(get_current_user)
):
    """
    Dispatches a sample security event to an enterprise webhook.
    Returns honest unconfigured status if webhook URL is not provided in env.
    """
    test_payload = data.payload or {
        "event": "SENTRY_SECURITY_ALERT_TEST",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "severity": "HIGH",
        "message": f"Test alert dispatched to {data.service} from Sentry Network Security Auditing Platform."
    }
    result = enterprise_integrations.send_event(data.service, test_payload)
    return result


@app.post("/api/audits/{audit_id}/feedback")
def submit_audit_feedback(
    audit_id: str,
    data: AuditFeedbackRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits user feedback (thumbs up / thumbs down / rating) for AI remediation guidance.
    Safely persisted inside existing audit record's risk_data_json without database migration.
    """
    success = save_audit_feedback(
        audit_id=audit_id,
        feedback_data={
            "user_id": user.id,
            "user_email": user.email,
            "rating": data.rating,
            "feedback_text": data.feedback_text,
            "rule_id": data.rule_id
        },
        db=db
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit record not found.")

    return {
        "message": "Audit feedback recorded successfully",
        "audit_id": audit_id,
        "rating": data.rating
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)