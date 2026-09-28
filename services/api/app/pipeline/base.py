from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field


class OCRPage(BaseModel):
    page_number: int
    text: str


class OCRResult(BaseModel):
    full_text: str
    pages: List[OCRPage]
    page_count: int
    detected_orientation_angle: float = 0.0


class ExtractedRow(BaseModel):
    test_name: str
    value: float
    unit: str
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    page: int = 1


class ExtractionResult(BaseModel):
    rows: List[ExtractedRow]
    validation_errors: List[str] = Field(default_factory=list)


class BaseOCRProvider(ABC):
    @abstractmethod
    async def process_document(self, file_bytes: bytes, mime_type: str) -> OCRResult:
        """Extract plain text from image (JPEG, PNG) or multi-page PDF."""
        pass


class BaseExtractionProvider(ABC):
    @abstractmethod
    async def extract_values(self, ocr_result: OCRResult) -> ExtractionResult:
        """Parse OCR text into structured test name, value, unit, and reference ranges."""
        pass
