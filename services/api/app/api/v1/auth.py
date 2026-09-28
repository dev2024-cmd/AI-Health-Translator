from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    sanitize_phone,
    mask_phone,
    generate_otp,
    verify_otp,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user_payload,
)
from app.core.audit import log_audit_event
from app.models.user import User
from app.models.patient import Patient
from app.schemas.auth import (
    OTPRequest,
    OTPRequestResponse,
    OTPVerifyRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/otp/request", response_model=OTPRequestResponse)
async def request_otp(data: OTPRequest):
    """
    Request an OTP for phone number login.
    In development mode, returns dev_otp in the response for seamless testing.
    """
    clean_phone = sanitize_phone(data.phone)
    if len(clean_phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format",
        )

    code = generate_otp(clean_phone)
    return OTPRequestResponse(
        message="OTP sent successfully",
        phone_masked=mask_phone(clean_phone),
        dev_otp=code if settings.OTP_DEV_MODE else None,
    )


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp_endpoint(
    data: OTPVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify OTP and log in. If the user does not exist, registers a new user with the requested role.
    """
    clean_phone = sanitize_phone(data.phone)
    is_valid = verify_otp(clean_phone, data.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code",
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.phone == clean_phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            phone=clean_phone,
            role=data.role or "patient",
            preferred_language=data.preferred_language or "en",
        )
        db.add(user)
        await db.flush()

        # If user is a patient, auto-create a linked patient record
        if user.role == "patient":
            patient = Patient(
                user_id=user.id,
                display_name=f"Patient {clean_phone[-4:]}",
                preferred_language=user.preferred_language,
                phone_for_ivr=user.phone,
                phone_type="smartphone",
            )
            db.add(patient)
            await db.flush()

        # Audit registration
        client_ip = request.client.host if request.client else "unknown"
        await log_audit_event(
            session=db,
            action="USER_REGISTERED",
            entity="User",
            entity_id=user.id,
            actor_id=user.id,
            ip_address=client_ip,
        )
    else:
        # Audit login
        client_ip = request.client.host if request.client else "unknown"
        await log_audit_event(
            session=db,
            action="USER_LOGIN",
            entity="User",
            entity_id=user.id,
            actor_id=user.id,
            ip_address=client_ip,
        )

    # Generate tokens
    token_payload = {
        "sub": user.id,
        "phone": user.phone,
        "role": user.role,
        "lang": user.preferred_language,
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh")
async def refresh_token_endpoint(
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a valid refresh token for a fresh access token.
    """
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type, refresh token required",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    token_payload = {
        "sub": user.id,
        "phone": user.phone,
        "role": user.role,
        "lang": user.preferred_language,
    }
    new_access_token = create_access_token(token_payload)
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Get profile information of the currently authenticated user.
    """
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse.model_validate(user)
