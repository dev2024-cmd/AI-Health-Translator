from app.core.config import settings
from app.pipeline.base import BaseOCRProvider
from app.pipeline.ocr.mock_ocr import MockOCRProvider
from app.pipeline.ocr.tesseract_ocr import TesseractOCRProvider
from app.pipeline.ocr.rapid_ocr import RapidOCRProvider


def get_ocr_provider() -> BaseOCRProvider:
    provider = settings.OCR_PROVIDER.lower()
    if provider in ("rapid", "rapidocr", "advanced", "neural", "auto"):
        return RapidOCRProvider()
    if provider == "tesseract":
        return TesseractOCRProvider()
    if provider == "mock":
        # Even under mock setting, if RapidOCR is available we prefer real extraction for uploaded docs
        return RapidOCRProvider()
    return RapidOCRProvider()

