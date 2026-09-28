from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class PatientCreate(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    preferred_language: str = Field("hi", description="ISO language code e.g. hi, te, bn, en")
    phone_for_ivr: str = Field(..., description="Phone number for automated voice calls and SMS summaries")
    phone_type: Literal["smartphone", "feature"] = "smartphone"


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    display_name: str
    preferred_language: str
    phone_for_ivr: str
    phone_type: str
    created_at: datetime


class CaregiverLinkCreate(BaseModel):
    patient_id: str


class CaregiverLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    caregiver_id: str
    patient_id: str
    status: str
    created_at: datetime
