import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    source = Column(String(20), nullable=False, default="app")  # app, whatsapp, web, health_worker
    status = Column(String(20), nullable=False, default="uploaded")  # uploaded, ocr, extracting, explaining, translating, audio, ready, failed
    document_type = Column(String(30), nullable=False, default="lab_report")  # lab_report, prescription
    original_language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="reports")
    uploader = relationship("User")
    files = relationship("ReportFile", back_populates="report", cascade="all, delete-orphan")
    extracted_values = relationship("ExtractedValue", back_populates="report", cascade="all, delete-orphan")
    explanations = relationship("Explanation", back_populates="report", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="report", cascade="all, delete-orphan")
    call_logs = relationship("CallLog", back_populates="report", cascade="all, delete-orphan")
