import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import uuid4
from sqlalchemy.orm import Session
from database import SessionLocal, AuditRecord, User


def save_audit_record(
    user_id: Any,
    vendor: str,
    security_score: int,
    risk_level: str,
    findings: List[Dict[str, Any]],
    risk_data: Optional[Dict[str, Any]] = None,
    hostname: Optional[str] = None,
    user_email: Optional[str] = None,
    filename: Optional[str] = None,
    audit_id: Optional[str] = None,
    db: Optional[Session] = None
) -> str:
    """
    Persists an audit record in the database using SQLAlchemy.
    Never stores plain passwords, raw configuration dumps, or secrets.
    """
    if not audit_id:
        audit_id = f"AUDIT-{datetime.now().strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"

    timestamp = datetime.now(timezone.utc).isoformat()

    total_findings = len(findings)
    critical_findings = sum(1 for f in findings if f.get("severity", "").lower() == "critical")

    if risk_data:
        high_findings = risk_data.get("high_findings", 0)
        medium_findings = risk_data.get("medium_findings", 0)
        low_findings = risk_data.get("low_findings", 0)
    else:
        high_findings = sum(1 for f in findings if f.get("severity", "").lower() == "high")
        medium_findings = sum(1 for f in findings if f.get("severity", "").lower() == "medium")
        low_findings = sum(1 for f in findings if f.get("severity", "").lower() == "low")

    # Safe integer user_id conversion if applicable
    int_user_id = None
    if user_id:
        try:
            int_user_id = int(user_id)
        except (ValueError, TypeError):
            int_user_id = None

    record = AuditRecord(
        audit_id=audit_id,
        timestamp=timestamp,
        user_id=int_user_id,
        user_email=user_email,
        vendor=vendor,
        hostname=hostname,
        security_score=security_score,
        risk_level=risk_level,
        total_findings=total_findings,
        critical_findings=critical_findings,
        high_findings=high_findings,
        medium_findings=medium_findings,
        low_findings=low_findings,
        filename=filename,
        findings_json=json.dumps(findings) if findings else None,
        risk_data_json=json.dumps(risk_data) if risk_data else None
    )

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    finally:
        if should_close:
            db.close()

    return audit_id


def get_user_audit_history(
    user_id: Any,
    limit: int = 50,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve audit history exclusively for the specified user_id in newest-first order.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        int_user_id = None
        if user_id:
            try:
                int_user_id = int(user_id)
            except (ValueError, TypeError):
                int_user_id = None

        query = db.query(AuditRecord)
        if int_user_id is not None:
            query = query.filter(AuditRecord.user_id == int_user_id)
        elif user_id:
            query = query.filter(AuditRecord.user_email == str(user_id))

        records = query.order_by(AuditRecord.created_at.desc()).limit(limit).all()

        results = []
        for r in records:
            results.append({
                "audit_id": r.audit_id,
                "timestamp": r.timestamp,
                "vendor": r.vendor,
                "hostname": r.hostname,
                "security_score": r.security_score,
                "risk_level": r.risk_level,
                "total_findings": r.total_findings,
                "critical_findings": r.critical_findings,
                "high_findings": r.high_findings,
                "medium_findings": r.medium_findings,
                "low_findings": r.low_findings,
                "filename": r.filename,
                "audit_status": "Completed"
            })
        return results
    finally:
        if should_close:
            db.close()


def get_all_audit_history(
    limit: int = 100,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Admin-level query to retrieve system-wide audits.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        records = db.query(AuditRecord).order_by(AuditRecord.created_at.desc()).limit(limit).all()
        results = []
        for r in records:
            results.append({
                "audit_id": r.audit_id,
                "timestamp": r.timestamp,
                "user_email": r.user_email,
                "vendor": r.vendor,
                "hostname": r.hostname,
                "security_score": r.security_score,
                "risk_level": r.risk_level,
                "total_findings": r.total_findings,
                "critical_findings": r.critical_findings,
                "high_findings": r.high_findings,
                "medium_findings": r.medium_findings,
                "low_findings": r.low_findings,
                "filename": r.filename,
                "audit_status": "Completed"
            })
        return results
    finally:
        if should_close:
            db.close()


def save_audit_feedback(
    audit_id: str,
    feedback_data: Dict[str, Any],
    db: Optional[Session] = None
) -> bool:
    """
    Saves user AI feedback (rating, comment, rule ID) into the existing
    risk_data_json payload of the audit record without altering DB schema.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        record = db.query(AuditRecord).filter(AuditRecord.audit_id == audit_id).first()
        if not record:
            return False

        risk_data = {}
        if record.risk_data_json:
            try:
                risk_data = json.loads(record.risk_data_json)
            except Exception:
                risk_data = {}

        feedbacks = risk_data.get("user_feedback", [])
        feedback_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **feedback_data
        }
        feedbacks.append(feedback_entry)
        risk_data["user_feedback"] = feedbacks

        record.risk_data_json = json.dumps(risk_data)
        db.commit()
        return True
    finally:
        if should_close:
            db.close()

