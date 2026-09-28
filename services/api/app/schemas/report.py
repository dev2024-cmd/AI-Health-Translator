from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ReportFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    storage_key: str
    mime: str
    page_count: int
    page_order: int = 1
    created_at: datetime


class ExtractedValueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    test_name: str
    value: float
    unit: str
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    flag: str
    page: int


class ExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    report_id: str
    language: str
    text: str
    audio_key: Optional[str] = None
    audio_available: bool
    generated_at: datetime


class TranslationRequest(BaseModel):
    target_language: str


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    uploaded_by: Optional[str] = None
    source: str
    status: str
    document_type: str = "lab_report"
    original_language: str
    created_at: datetime
    files: List[ReportFileResponse] = Field(default_factory=list)
    extracted_values: List[ExtractedValueResponse] = Field(default_factory=list)
    explanations: List[ExplanationResponse] = Field(default_factory=list)


class ReportUploadResponse(BaseModel):
    report_id: str
    status: str
    message: str
    files_uploaded: int
