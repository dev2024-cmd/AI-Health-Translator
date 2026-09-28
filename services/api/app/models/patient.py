import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    display_name = Column(String(100), nullable=False)
    preferred_language = Column(String(10), nullable=False, default="en")
    phone_for_ivr = Column(String(20), nullable=False, index=True)
    phone_type = Column(String(20), nullable=False, default="smartphone")  # smartphone, feature
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="patients")
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")
    caregivers = relationship("CaregiverLink", back_populates="patient", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="patient", cascade="all, delete-orphan")
    call_logs = relationship("CallLog", back_populates="patient", cascade="all, delete-orphan")
