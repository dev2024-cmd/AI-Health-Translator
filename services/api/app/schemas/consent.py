from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ConsentCreate(BaseModel):
    purpose: str = Field(
        "medical_report_ocr_simplification_and_voice_assistance",
        description="Explicit DPDP Act 2023 purpose description",
    )


class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    purpose: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
