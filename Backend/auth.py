import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db, User

load_dotenv()

# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sih_2026_aegisnet_super_secure_jwt_secret_key_change_in_prod")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours default for demo

# Password hasher using Argon2id
password_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=1,
    hash_len=32,
    salt_len=16
)

# HTTP Bearer security scheme
bearer_scheme = HTTPBearer(auto_error=False)


# ==============================================================================
# PASSWORD HASHING
# ==============================================================================

def hash_password(password: str) -> str:
    """
    Hashes a plain text password using Argon2id.
    Never stores plain text passwords.
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against an Argon2 hash.
    Returns False on mismatch without leaking timing details.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        return password_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False
    except Exception:
        return False


# ==============================================================================
# JWT TOKEN GENERATION & VERIFICATION
# ==============================================================================

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    Payload includes subject (email), user ID, name, role, and expiration timestamp.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates JWT token signature and expiration.
    Raises HTTPException(401) on invalid or expired token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )


# ==============================================================================
# FASTAPI DEPENDENCIES: USER AUTHENTICATION & RBAC
# ==============================================================================

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Validates Bearer token and returns the authenticated User instance from the database.
    Enforces active user state.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(credentials.credentials)
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject identification.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated."
        )

    return user


def verify_token(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Backward-compatible adapter returning user dict format
    previously expected by existing backend route handlers.
    """
    return {
        "uid": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "user_obj": current_user
    }


def require_role(allowed_roles: List[str]):
    """
    Role-Based Access Control (RBAC) dependency factory.
    Enforces that the current authenticated user belongs to one of the allowed roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").lower()
        allowed = [r.lower() for r in allowed_roles]
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This action requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


# Convenient RBAC dependencies
require_admin = require_role(["admin"])
require_auditor = require_role(["auditor", "admin"])
