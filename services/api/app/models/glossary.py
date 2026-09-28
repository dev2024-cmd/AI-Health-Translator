import uuid
import json
from sqlalchemy import Column, String, Text, JSON
from app.models.base import Base

try:
    from pgvector.sqlalchemy import Vector
    VECTOR_AVAILABLE = True
except ImportError:
    VECTOR_AVAILABLE = False


def create_vector_column(dim: int = 384):
    if VECTOR_AVAILABLE:
        return Column(Vector(dim), nullable=True)
    return Column(Text, nullable=True)


class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    term = Column(String(100), unique=True, index=True, nullable=False)
    aliases = Column(JSON, nullable=False, default=list)  # list of alias strings
    definition_simple = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    embedding = create_vector_column(384)
