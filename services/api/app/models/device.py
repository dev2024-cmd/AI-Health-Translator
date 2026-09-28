import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Device(Base):
    """
    Device registration and PIN authentication record.
    Supports 4-digit MPIN for mobile and 6-digit PIN for web.
    Includes security counters for progressive lockout (15 mins, doubling on repeat).
    """
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(10), nullable=False)  # 'mobile' or 'web'
    device_label = Column(String(100), nullable=False)  # e.g., 'Pixel 7', 'Chrome / Windows'
    pin_hash = Column(String(255), nullable=True)  # Argon2id hash
    pin_set_at = Column(DateTime(timezone=True), nullable=True)
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    lockout_count = Column(Integer, default=0, nullable=False)  # Multiplier for repeat lockout doubling
    last_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="devices")
