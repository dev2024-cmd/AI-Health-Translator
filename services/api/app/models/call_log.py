import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(10), nullable=False)  # ivr, sms
    provider_sid = Column(String(100), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="initiated")
    keypad_events = Column(JSON, nullable=True, default=list)  # list of DTMF keypress events
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="call_logs")
    report = relationship("Report", back_populates="call_logs")
