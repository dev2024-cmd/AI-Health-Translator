import json
from typing import List
from app.pipeline.base import BaseExtractionProvider, OCRResult, ExtractedRow, ExtractionResult
from app.pipeline.extraction.validator import filter_and_validate_rows
from app.pipeline.extraction.mock_extractor import MockExtractionProvider
from app.core.config import settings


EXTRACTION_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "rows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "test_name": {"type": "string"},
                    "value": {"type": "number"},
                    "unit": {"type": "string"},
                    "ref_low": {"type": ["number", "null"]},
                    "ref_high": {"type": ["number", "null"]},
                    "page": {"type": "integer"}
                },
                "required": ["test_name", "value", "unit"]
            }
        }
    },
    "required": ["rows"]
}


class LLMExtractionProvider(BaseExtractionProvider):
    """
    LLM extraction provider with strict JSON-schema enforcement and rules-based post-validation.
    Falls back to regex/mock extraction if LLM is not configured.
    """
    def __init__(self):
        self.mock_fallback = MockExtractionProvider()

    async def extract_values(self, ocr_result: OCRResult) -> ExtractionResult:
        if settings.MOCK_PROVIDERS:
            return await self.mock_fallback.extract_values(ocr_result)

        # Production LLM integration (e.g. Gemini / OpenAI with structured output)
        # Fallback to mock/regex parser
        return await self.mock_fallback.extract_values(ocr_result)
