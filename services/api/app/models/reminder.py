import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), nullable=False, index=True)
    patient_name = Column(String(100), nullable=False)
    created_by_user_id = Column(String(36), nullable=False, index=True)
    type = Column(String(30), nullable=False, default="medication")  # "medication" or "checkup"
    title = Column(String(200), nullable=False)  # e.g., "Metformin 500mg" or "Dr. Anand HbA1c Checkup"
    dosage = Column(String(100), nullable=True)  # e.g., "1 tablet after meals"
    scheduled_time = Column(String(50), nullable=False)  # e.g., "08:00 AM" or "30 Sep 2026, 10:00 AM"
    period = Column(String(30), nullable=True, default="morning")  # "morning", "afternoon", "night", "checkup"
    days = Column(String(100), nullable=True, default="Daily")  # "Daily", "Weekly", "Mon, Wed, Fri"
    notify_family = Column(Boolean, default=True, nullable=False)
    status = Column(String(30), default="pending", nullable=False)  # "pending", "taken", "missed", "completed"
    last_taken_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    notifications = relationship("FamilyNotification", back_populates="reminder", cascade="all, delete-orphan")


class FamilyNotification(Base):
    __tablename__ = "family_notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reminder_id = Column(String(36), ForeignKey("reminders.id", ondelete="CASCADE"), nullable=True)
    patient_id = Column(String(36), nullable=False, index=True)
    from_patient_name = Column(String(100), nullable=False)
    to_user_id = Column(String(36), nullable=True, index=True)  # Caregiver / family recipient
    notification_type = Column(String(50), nullable=False)  # "medication_due", "medication_taken", "missed_alert", "checkup_due"
    message = Column(Text, nullable=False)
    urgency = Column(String(20), default="normal", nullable=False)  # "normal", "urgent", "info"
    read_status = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    reminder = relationship("Reminder", back_populates="notifications")
