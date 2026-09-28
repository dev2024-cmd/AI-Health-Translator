import time
import random
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)

# In-memory store for OTPs in dev/fallback: phone -> {code, expires_at, attempts}
_otp_store: Dict[str, Dict[str, Any]] = {}


def sanitize_phone(phone: str) -> str:
    """Normalize phone number to standard E.164-style or 10-digit Indian format."""
    digits = re.sub(r'\D', '', phone)
    if len(digits) == 12 and digits.startswith('91'):
        return '+' + digits
    if len(digits) == 10:
        return '+91' + digits
    if len(digits) > 10:
        return '+' + digits
    return phone.strip()


def mask_phone(phone: str) -> str:
    """Mask phone number for safe DPDP-compliant logging. e.g. +91 98*** **321"""
    sanitized = sanitize_phone(phone)
    if len(sanitized) >= 8:
        return sanitized[:5] + '****' + sanitized[-3:]
    return '***'


def generate_otp(phone: str) -> str:
    """Generate or retrieve OTP for the given phone number."""
    clean_phone = sanitize_phone(phone)
    if settings.OTP_DEV_MODE:
        code = settings.OTP_DEFAULT_CODE
    else:
        code = str(random.randint(100000, 999999))

    expires_at = time.time() + settings.OTP_EXPIRY_SECONDS
    _otp_store[clean_phone] = {
        "code": code,
        "expires_at": expires_at,
        "attempts": 0,
    }
    return code


def verify_otp(phone: str, code: str) -> bool:
    """Verify an OTP code against stored values."""
    clean_phone = sanitize_phone(phone)
    record = _otp_store.get(clean_phone)

    if not record:
        return False

    if time.time() > record["expires_at"]:
        _otp_store.pop(clean_phone, None)
        return False

    if record["attempts"] >= settings.MAX_OTP_ATTEMPTS:
        _otp_store.pop(clean_phone, None)
        return False

    record["attempts"] += 1

    if record["code"] == code:
        _otp_store.pop(clean_phone, None)
        return True

    return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """Extract and validate current authenticated user payload."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type, access token required",
        )
    return payload


def require_roles(allowed_roles: List[str]):
    """Role-based access control dependency factory."""
    async def role_checker(payload: dict = Depends(get_current_user_payload)) -> dict:
        role = payload.get("role")
        if role not in allowed_roles and role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required role: {', '.join(allowed_roles)}",
            )
        return payload

    return role_checker
