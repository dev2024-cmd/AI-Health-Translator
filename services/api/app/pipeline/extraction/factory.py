from app.core.config import settings
from app.pipeline.base import BaseExtractionProvider
from app.pipeline.extraction.mock_extractor import MockExtractionProvider
from app.pipeline.extraction.llm_extractor import LLMExtractionProvider


def get_extraction_provider() -> BaseExtractionProvider:
    provider = settings.EXTRACTION_PROVIDER.lower()
    if provider == "llm":
        return LLMExtractionProvider()
    return MockExtractionProvider()
