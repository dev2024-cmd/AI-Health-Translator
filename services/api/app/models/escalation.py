import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open")  # open, assigned, resolved
    assigned_to = Column(String(36), ForeignKey("health_workers.id", ondelete="SET NULL"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    report = relationship("Report", back_populates="escalations")
    patient = relationship("Patient", back_populates="escalations")
    assigned_health_worker = relationship("HealthWorker", back_populates="assigned_escalations")
