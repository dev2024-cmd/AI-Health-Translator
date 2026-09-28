from app.core.config import settings
from app.pipeline.base import BaseOCRProvider
from app.pipeline.ocr.mock_ocr import MockOCRProvider
from app.pipeline.ocr.tesseract_ocr import TesseractOCRProvider


def get_ocr_provider() -> BaseOCRProvider:
    provider = settings.OCR_PROVIDER.lower()
    if provider == "tesseract":
        return TesseractOCRProvider()
    return MockOCRProvider()
