import os
import re
import time
from collections import defaultdict
from typing import Tuple, Set
from fastapi import HTTPException, status, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# Supported configuration extensions strictly per specification
ALLOWED_EXTENSIONS: Set[str] = {".cfg", ".conf", ".json", ".yaml"}

# 5 MB maximum upload file size limit
MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024

# Supported vendors
SUPPORTED_VENDORS: Set[str] = {
    "cisco", "juniper", "fortinet", "palo alto", "huawei", "arista", "pfsense"
}


# ==============================================================================
# 1. MODULAR RATE LIMITING
# ==============================================================================

class BaseRateLimiter:
    """Abstract interface for rate limiting (supports in-memory or Redis)."""
    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        raise NotImplementedError


class InMemoryRateLimiter(BaseRateLimiter):
    """
    Sliding-window in-memory rate limiter.
    Stores request timestamps per client key.
    """
    def __init__(self):
        self._history = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - window_seconds
        
        # Purge older timestamps
        self._history[key] = [t for t in self._history[key] if t > window_start]
        
        current_count = len(self._history[key])
        if current_count >= max_requests:
            retry_after = int(window_seconds - (now - self._history[key][0]))
            return False, max(1, retry_after)
        
        self._history[key].append(now)
        return True, 0


# Singleton rate limiter instance for auth endpoints
auth_rate_limiter = InMemoryRateLimiter()


def check_auth_rate_limit(request: Request, max_requests: int = 15, window_seconds: int = 60) -> None:
    """
    Dependency/helper to limit brute force login/registration attempts.
    """
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = auth_rate_limiter.is_allowed(client_ip, max_requests, window_seconds)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many authentication attempts. Please retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )


# ==============================================================================
# 2. FILENAME SANITIZATION & PATH TRAVERSAL DEFENSE
# ==============================================================================

def sanitize_filename(filename: str) -> str:
    """
    Sanitizes uploaded filenames to prevent directory traversal and null byte injections.
    Extracts strictly the base filename and strips harmful characters.
    """
    if not filename:
        return "unnamed_config.cfg"
    
    # Strip null bytes and control chars
    cleaned = filename.replace("\x00", "").strip()
    
    # Extract only the base name (handles both Unix / and Windows \ separators)
    cleaned = os.path.basename(cleaned)
    cleaned = cleaned.split("/")[-1].split("\\")[-1]
    
    # Replace dangerous characters with underscores
    cleaned = re.sub(r'[^a-zA-Z0-9_\.\-]', '_', cleaned)
    
    # Prevent hidden file or empty name
    if not cleaned or cleaned.startswith("."):
        cleaned = "sanitized_" + cleaned.lstrip(".")
        
    return cleaned


# ==============================================================================
# 3. UPLOAD VALIDATION
# ==============================================================================

def validate_uploaded_file(filename: str, content: bytes) -> str:
    """
    Validates uploaded configuration files:
    - Extension must be one of .cfg, .conf, .json, .yaml
    - File size must not exceed MAX_UPLOAD_SIZE_BYTES (5MB)
    - Content must be non-empty and decode safely as text
    """
    # 1. Extension check
    _, ext = os.path.splitext(filename or "")
    ext_lower = ext.lower()
    if ext_lower not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed configuration formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # 2. Size check
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed upload size of {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB."
        )

    if not content or not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded configuration file is empty."
        )

    # 3. Safe text decoding without execution
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            decoded = content.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to decode file. Please ensure the file is a valid text configuration."
            )

    return decoded


def validate_vendor_name(vendor: str) -> str:
    """
    Validates that a provided vendor matches supported vendor profiles.
    """
    if not vendor or not vendor.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor name cannot be empty."
        )
    v_clean = vendor.strip().lower()
    for supported in SUPPORTED_VENDORS:
        if supported in v_clean:
            # Return canonical title
            return supported.title()
    return vendor.strip()


# ==============================================================================
# 4. MODERN SECURITY HEADERS MIDDLEWARE
# ==============================================================================

class ModernSecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects modern, industry-standard security headers into every response.
    Explicitly omits obsolete X-XSS-Protection.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' http: https: ws:; "
            "frame-ancestors 'none';"
        )
        return response


# ==============================================================================
# 5. CRYPTOGRAPHIC AUDIT INTEGRITY FINGERPRINT
# ==============================================================================

def compute_audit_integrity_hash(
    audit_id: str,
    vendor: str,
    security_score: int,
    findings: list = None
) -> str:
    """
    Computes a deterministic, tamper-evident SHA-256 cryptographic fingerprint
    binding audit ID, vendor, score, and the findings catalog.
    """
    import hashlib
    if findings:
        findings_summary = ",".join(sorted(str(f.get("rule_id", "")) for f in findings if isinstance(f, dict)))
    else:
        findings_summary = "CLEAN"
    raw_payload = f"{audit_id}:{vendor}:{security_score}:{findings_summary}"
    return hashlib.sha256(raw_payload.encode()).hexdigest()
