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
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str
