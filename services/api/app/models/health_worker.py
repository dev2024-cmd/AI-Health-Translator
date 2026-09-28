import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class HealthWorker(Base):
    __tablename__ = "health_workers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    region = Column(String(100), nullable=False)
    languages = Column(JSON, nullable=False, default=list)  # list of language codes e.g. ["hi", "te"]
    is_available = Column(Boolean, nullable=False, default=True)

    # Relationships
    user = relationship("User", back_populates="health_worker_profile")
    assigned_escalations = relationship("Escalation", back_populates="assigned_health_worker")
