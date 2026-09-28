import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), unique=True, index=True, nullable=False)
    role = Column(String(20), nullable=False, default="patient")  # patient, caregiver, health_worker, admin
    preferred_language = Column(String(10), nullable=False, default="en")
    name = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    usage = Column(String(20), nullable=False, default="self")  # self, caregiver
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    patients = relationship("Patient", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="user", cascade="all, delete-orphan")
    health_worker_profile = relationship("HealthWorker", back_populates="user", uselist=False)
