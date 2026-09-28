import io
import asyncio
from PIL import Image
from app.pipeline.base import BaseOCRProvider, OCRResult, OCRPage
from app.pipeline.ocr.prep import preprocess_image, extract_pdf_pages_text
from app.pipeline.ocr.mock_ocr import MockOCRProvider
from app.core.config import settings


class TesseractOCRProvider(BaseOCRProvider):
    """
    Tesseract OCR provider with local fallback to MockOCR if tesseract binary is unavailable.
    """
    def __init__(self):
        self.mock_fallback = MockOCRProvider()

    async def process_document(self, file_bytes: bytes, mime_type: str) -> OCRResult:
        if "pdf" in mime_type:
            pdf_pages = extract_pdf_pages_text(file_bytes)
            if pdf_pages:
                pages = [OCRPage(page_number=i+1, text=p) for i, p in enumerate(pdf_pages)]
                return OCRResult(
                    full_text="\n\n".join(pdf_pages),
                    pages=pages,
                    page_count=len(pages),
                )

        try:
            import pytesseract
            processed_bytes, angle = preprocess_image(file_bytes)
            image = Image.open(io.BytesIO(processed_bytes))

            def _run_tesseract():
                # Attempt OCR with standard English + Indian scripts
                return pytesseract.image_to_string(image, lang="eng+hin+tel+ben+tam")

            text = await asyncio.to_thread(_run_tesseract)
            if text and len(text.strip()) > 10:
                page = OCRPage(page_number=1, text=text.strip())
                return OCRResult(
                    full_text=text.strip(),
                    pages=[page],
                    page_count=1,
                    detected_orientation_angle=angle,
                )
        except Exception:
            pass

        # Fallback to mock
        return await self.mock_fallback.process_document(file_bytes, mime_type)
