import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(10), nullable=False, index=True)
    text = Column(Text, nullable=False)
    audio_key = Column(String(255), nullable=True)
    audio_available = Column(Boolean, nullable=False, default=False)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    report = relationship("Report", back_populates="explanations")
