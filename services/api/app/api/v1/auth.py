from datetime import datetime, timezone, timedelta
from typing import List

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
    hash_pin,
    verify_pin,
    validate_pin_strength,
    calculate_lockout_duration_minutes,
)
from app.core.audit import log_audit_event
from app.models.user import User
from app.models.patient import Patient
from app.models.device import Device
from app.schemas.auth import (
    OTPRequest,
    OTPRequestResponse,
    OTPVerifyRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
    ProfileUpdateRequest,
    PinSetRequest,
    PinVerifyRequest,
    PinChangeRequest,
    PinResetRequest,
    DeviceLogoutRequest,
    DeviceResponse,
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


@router.post("/signup/profile", response_model=UserResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Complete user signup profile with name, age, preferred language, and usage mode.
    Syncs the profile with the default linked patient record.
    """
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.name = data.name.strip()
    if data.age is not None:
        user.age = data.age
    if data.preferred_language:
        user.preferred_language = data.preferred_language
    if data.usage:
        user.usage = data.usage

    # Sync primary patient profile display name
    pat_res = await db.execute(select(Patient).where(Patient.user_id == user.id))
    patient = pat_res.scalar_one_or_none()
    if patient:
        patient.display_name = user.name
        patient.preferred_language = user.preferred_language

    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        session=db,
        action="PROFILE_UPDATED",
        entity="User",
        entity_id=user.id,
        actor_id=user.id,
        ip_address=client_ip,
    )
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/pin/set")
async def set_pin(
    data: PinSetRequest,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Configure a device-bound PIN (4-digit MPIN for mobile, 6-digit PIN for web).
    Rejects weak PINs (all same digit, simple sequences, birth-year patterns).
    Hashes PIN with Argon2id and never stores or logs the plain PIN.
    """
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if data.confirm_pin and data.pin != data.confirm_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PINs do not match",
        )

    # Validate PIN strength
    is_valid, err_msg = validate_pin_strength(data.pin, data.platform, user.age)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )

    hashed_pin = hash_pin(data.pin)
    now = datetime.now(timezone.utc)

    device = None
    if data.device_id:
        dev_res = await db.execute(
            select(Device).where(Device.id == data.device_id, Device.user_id == user.id)
        )
        device = dev_res.scalar_one_or_none()

    if not device:
        device = Device(
            user_id=user.id,
            platform=data.platform,
            device_label=data.device_label,
            pin_hash=hashed_pin,
            pin_set_at=now,
            failed_attempts=0,
            locked_until=None,
            lockout_count=0,
            last_seen=now,
        )
        db.add(device)
    else:
        device.platform = data.platform
        device.device_label = data.device_label
        device.pin_hash = hashed_pin
        device.pin_set_at = now
        device.failed_attempts = 0
        device.locked_until = None
        device.lockout_count = 0
        device.last_seen = now

    await db.flush()

    # Log audit event WITHOUT PIN value
    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        session=db,
        action="PIN_SET",
        entity="Device",
        entity_id=device.id,
        actor_id=user.id,
        ip_address=client_ip,
    )
    await db.commit()

    # Generate device-bound tokens
    token_payload = {
        "sub": user.id,
        "phone": user.phone,
        "role": user.role,
        "lang": user.preferred_language,
        "device_id": device.id,
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return {
        "message": "PIN configured successfully",
        "device_id": device.id,
        "platform": device.platform,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": UserResponse.model_validate(user),
    }


@router.post("/pin/verify", response_model=TokenResponse)
async def verify_pin_endpoint(
    data: PinVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify server-side Argon2id PIN for a registered device.
    Locks device after 5 wrong attempts (15 minutes, doubling on repeat).
    Issues device-bound tokens on success.
    """
    dev_res = await db.execute(select(Device).where(Device.id == data.device_id))
    device = dev_res.scalar_one_or_none()
    if not device or not device.pin_hash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device or PIN not found for this device",
        )

    now = datetime.now(timezone.utc)
    client_ip = request.client.host if request.client else "unknown"

    # Check lockout
    if device.locked_until:
        locked_until = device.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if now < locked_until:
            remaining_secs = int((locked_until - now).total_seconds())
            remaining_mins = max(1, remaining_secs // 60)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Device temporarily locked. Try again in {remaining_mins} minute(s) or reset PIN using OTP.",
            )

    # Server-side verify
    is_correct = verify_pin(data.pin, device.pin_hash)

    if not is_correct:
        device.failed_attempts += 1
        if device.failed_attempts >= 5:
            duration_mins = calculate_lockout_duration_minutes(device.lockout_count)
            device.locked_until = now + timedelta(minutes=duration_mins)
            device.lockout_count += 1
            device.failed_attempts = 0

            await log_audit_event(
                session=db,
                action="PIN_LOCKOUT",
                entity="Device",
                entity_id=device.id,
                actor_id=device.user_id,
                ip_address=client_ip,
            )
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"PIN locked after 5 failed attempts. Device locked for {duration_mins} minutes.",
            )
        else:
            remaining = 5 - device.failed_attempts
            await log_audit_event(
                session=db,
                action="PIN_FAILED",
                entity="Device",
                entity_id=device.id,
                actor_id=device.user_id,
                ip_address=client_ip,
            )
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Incorrect PIN. {remaining} attempt(s) remaining before lockout.",
            )

    # Success: reset failed attempts & lockout
    device.failed_attempts = 0
    device.locked_until = None
    device.lockout_count = 0
    device.last_seen = now

    await log_audit_event(
        session=db,
        action="PIN_VERIFIED",
        entity="Device",
        entity_id=device.id,
        actor_id=device.user_id,
        ip_address=client_ip,
    )
    await db.commit()

    user_res = await db.execute(select(User).where(User.id == device.user_id))
    user = user_res.scalar_one_or_none()
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
        "device_id": device.id,
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        device_id=device.id,
        user=UserResponse.model_validate(user),
    )


@router.post("/pin/change")
async def change_pin(
    data: PinChangeRequest,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Change PIN on a registered device using current PIN.
    """
    user_id = payload.get("sub")
    dev_res = await db.execute(
        select(Device).where(Device.id == data.device_id, Device.user_id == user_id)
    )
    device = dev_res.scalar_one_or_none()
    if not device or not device.pin_hash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    # Verify old PIN
    if not verify_pin(data.old_pin, device.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current PIN is incorrect",
        )

    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()

    # Validate new PIN
    is_valid, err_msg = validate_pin_strength(
        data.new_pin, device.platform, user.age if user else None
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )

    device.pin_hash = hash_pin(data.new_pin)
    device.pin_set_at = datetime.now(timezone.utc)
    device.failed_attempts = 0
    device.locked_until = None
    device.lockout_count = 0

    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        session=db,
        action="PIN_CHANGED",
        entity="Device",
        entity_id=device.id,
        actor_id=user_id,
        ip_address=client_ip,
    )
    await db.commit()

    return {"message": "PIN updated successfully"}


@router.post("/pin/reset", response_model=TokenResponse)
async def reset_pin(
    data: PinResetRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Reset PIN after lockout or forgotten PIN.
    STRICTLY requires a fresh valid OTP verification for the user's phone number.
    """
    clean_phone = sanitize_phone(data.phone)
    is_valid = verify_otp(clean_phone, data.otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Reset requires fresh OTP verification.",
        )

    user_res = await db.execute(select(User).where(User.phone == clean_phone))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    dev_res = await db.execute(
        select(Device).where(Device.id == data.device_id, Device.user_id == user.id)
    )
    device = dev_res.scalar_one_or_none()
    if not device:
        device = Device(
            id=data.device_id,
            user_id=user.id,
            platform="mobile" if len(data.new_pin) == 4 else "web",
            device_label="Reset Device",
            pin_hash=None,
        )
        db.add(device)
        await db.flush()

    is_valid, err_msg = validate_pin_strength(data.new_pin, device.platform, user.age)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )

    now = datetime.now(timezone.utc)
    device.pin_hash = hash_pin(data.new_pin)
    device.pin_set_at = now
    device.failed_attempts = 0
    device.locked_until = None
    device.lockout_count = 0
    device.last_seen = now

    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        session=db,
        action="PIN_RESET",
        entity="Device",
        entity_id=device.id,
        actor_id=user.id,
        ip_address=client_ip,
    )
    await db.commit()

    token_payload = {
        "sub": user.id,
        "phone": user.phone,
        "role": user.role,
        "lang": user.preferred_language,
        "device_id": device.id,
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        device_id=device.id,
        user=UserResponse.model_validate(user),
    )


@router.post("/devices/logout")
async def logout_device(
    data: DeviceLogoutRequest,
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Log out a device session and record audit event.
    """
    user_id = payload.get("sub")
    dev_res = await db.execute(
        select(Device).where(Device.id == data.device_id, Device.user_id == user_id)
    )
    device = dev_res.scalar_one_or_none()
    if device:
        device.last_seen = datetime.now(timezone.utc)
        client_ip = request.client.host if request.client else "unknown"
        await log_audit_event(
            session=db,
            action="DEVICE_LOGOUT",
            entity="Device",
            entity_id=device.id,
            actor_id=user_id,
            ip_address=client_ip,
        )
        await db.commit()

    return {"message": "Device logged out successfully"}


@router.get("/devices")
async def list_user_devices(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List all registered devices for the current user.
    """
    user_id = payload.get("sub")
    res = await db.execute(select(Device).where(Device.user_id == user_id))
    devices = res.scalars().all()
    return [
        {
            "id": d.id,
            "platform": d.platform,
            "device_label": d.device_label,
            "pin_set": bool(d.pin_hash),
            "locked_until": d.locked_until,
            "last_seen": d.last_seen,
        }
        for d in devices
    ]
