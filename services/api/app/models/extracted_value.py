import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class ExtractedValue(Base):
    __tablename__ = "extracted_values"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(100), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    ref_low = Column(Float, nullable=True)
    ref_high = Column(Float, nullable=True)
    flag = Column(String(20), nullable=False, default="normal")  # normal, low, high, critical
    page = Column(Integer, nullable=False, default=1)

    # Relationships
    report = relationship("Report", back_populates="extracted_values")
