from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class OTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian phone number or E.164 format (+91XXXXXXXXXX)")


class OTPRequestResponse(BaseModel):
    message: str
    phone_masked: str
    dev_otp: Optional[str] = None


class OTPVerifyRequest(BaseModel):
    phone: str
    code: str = Field(..., min_length=4, max_length=8)
    role: Optional[Literal["patient", "caregiver", "health_worker", "admin"]] = "patient"
    preferred_language: Optional[str] = "en"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: str
    role: str
    preferred_language: str
    name: Optional[str] = None
    age: Optional[int] = None
    usage: Optional[str] = "self"
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    device_id: Optional[str] = None
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str
    device_id: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=120)
    preferred_language: Optional[str] = "en"
    usage: Optional[Literal["self", "caregiver"]] = "self"


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    platform: str
    device_label: str
    pin_set: bool
    locked_until: Optional[datetime] = None
    last_seen: datetime


class PinSetRequest(BaseModel):
    platform: Literal["mobile", "web"]
    device_label: str = Field(..., min_length=1, max_length=100)
    device_id: Optional[str] = None
    pin: str
    confirm_pin: Optional[str] = None


class PinVerifyRequest(BaseModel):
    device_id: str
    pin: str


class PinChangeRequest(BaseModel):
    device_id: str
    old_pin: str
    new_pin: str


class PinResetRequest(BaseModel):
    phone: str
    otp_code: str
    device_id: str
    new_pin: str


class DeviceLogoutRequest(BaseModel):
    device_id: str
