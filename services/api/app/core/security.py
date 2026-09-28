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

from argon2 import PasswordHasher, Type
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)

# Argon2id password hasher (OWASP recommended parameters)
_argon2_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=19456,  # 19 MiB
    parallelism=1,
    hash_len=32,
    type=Type.ID
)

# In-memory store for OTPs in dev/fallback: phone -> {code, expires_at, attempts}
_otp_store: Dict[str, Dict[str, Any]] = {}


def hash_pin(pin: str) -> str:
    """Hash PIN using Argon2id with strict OWASP parameters."""
    return _argon2_hasher.hash(pin)


def verify_pin(pin: str, hashed_pin: str) -> bool:
    """Verify PIN with Argon2id constant-time verification."""
    if not hashed_pin:
        return False
    try:
        return _argon2_hasher.verify(hashed_pin, pin)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def validate_pin_strength(pin: str, platform: str, user_age: Optional[int] = None) -> tuple[bool, Optional[str]]:
    """
    Validate PIN strength.
    - Mobile: 4 digits (MPIN)
    - Web: 6 digits (PIN)
    Rejects:
    - Non-digits or wrong length
    - All same digits (e.g. 1111, 000000)
    - Simple ascending or descending sequences (e.g. 1234, 4321, 123456)
    - Simple repeating patterns (e.g. 1212, 123123)
    - Birth-year patterns (starts with 19xx/20xx or matches calculated birth year from age)
    """
    if not pin or not pin.isdigit():
        return False, "PIN must consist of digits only"

    expected_len = 4 if platform == "mobile" else 6
    if len(pin) != expected_len:
        return False, f"PIN must be exactly {expected_len} digits for {platform}"

    # Check identical digits
    if len(set(pin)) == 1:
        return False, "PIN cannot consist of all identical digits"

    # Check ascending or descending sequential patterns
    diffs = [int(pin[i + 1]) - int(pin[i]) for i in range(len(pin) - 1)]
    if all(d == 1 for d in diffs) or all(d == -1 for d in diffs):
        return False, "PIN cannot be a simple sequential number (e.g. 1234, 4321)"

    # Check circular sequential patterns like 9012 or 0987
    circular_patterns = ["01234567890123456789", "98765432109876543210"]
    if any(pin in pat for pat in circular_patterns):
        return False, "PIN cannot be a sequential sequence"

    # Check repeating pattern
    if len(pin) == 4 and pin[:2] == pin[2:]:
        return False, "PIN cannot be a repeating pattern (e.g. 1212)"
    if len(pin) == 6:
        if pin[:3] == pin[3:] or (pin[:2] == pin[2:4] == pin[4:]):
            return False, "PIN cannot be a repeating pattern (e.g. 123123 or 121212)"

    # Check birth-year patterns
    current_year = datetime.now(timezone.utc).year
    if len(pin) == 4 and (pin.startswith("19") or pin.startswith("20")):
        year_val = int(pin)
        if 1900 <= year_val <= current_year + 5:
            return False, "PIN cannot be a birth-year pattern (e.g. 1985, 2004)"

    if len(pin) == 6:
        # Check if contains 4-digit year pattern
        for i in range(3):
            sub = pin[i:i + 4]
            if sub.startswith(("19", "20")):
                year_val = int(sub)
                if 1900 <= year_val <= current_year + 5:
                    return False, "PIN cannot contain a birth-year pattern"

    # Check specific user age match
    if user_age and 0 < user_age < 120:
        birth_year_str = str(current_year - user_age)
        if birth_year_str in pin:
            return False, "PIN cannot match your birth year"

    return True, None


def calculate_lockout_duration_minutes(lockout_count: int) -> int:
    """
    Lockout after 5 wrong attempts:
    - 1st lockout: 15 minutes
    - 2nd lockout: 30 minutes
    - 3rd lockout: 60 minutes, etc. (capped at 24 hours / 1440 minutes).
    """
    multiplier = 2 ** min(lockout_count, 6)
    return min(15 * multiplier, 1440)


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
