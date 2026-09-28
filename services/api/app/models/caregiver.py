import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class CaregiverLink(Base):
    __tablename__ = "caregiver_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    caregiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active")  # pending, active, revoked
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    caregiver = relationship("User")
    patient = relationship("Patient", back_populates="caregivers")
