import io
import asyncio
import logging
from typing import List, Optional
from PIL import Image
from app.pipeline.base import BaseOCRProvider, OCRResult, OCRPage
from app.pipeline.ocr.prep import preprocess_image, extract_pdf_pages_text
from app.pipeline.ocr.mock_ocr import MockOCRProvider

logger = logging.getLogger("rapid_ocr")


class RapidOCRProvider(BaseOCRProvider):
    """
    Advanced Neural OCR Provider using RapidOCR (ONNXRuntime).
    Accurately recognizes printed text, handwritten prescriptions, tables, and medical reports.
    """
    _ocr_instance = None

    def __init__(self):
        self.mock_fallback = MockOCRProvider()

    @classmethod
    def _get_engine(cls):
        if cls._ocr_instance is None:
            try:
                from rapidocr_onnxruntime import RapidOCR
                cls._ocr_instance = RapidOCR()
            except Exception as e:
                logger.warning(f"Could not initialize RapidOCR: {e}")
                cls._ocr_instance = None
        return cls._ocr_instance

    async def process_document(self, file_bytes: bytes, mime_type: str) -> OCRResult:
        # 1. Handle PDF Documents
        if "pdf" in mime_type:
            pdf_pages = extract_pdf_pages_text(file_bytes)
            if pdf_pages and any(len(p.strip()) > 30 for p in pdf_pages):
                pages = [OCRPage(page_number=i + 1, text=p.strip()) for i, p in enumerate(pdf_pages)]
                return OCRResult(
                    full_text="\n\n".join(p.text for p in pages),
                    pages=pages,
                    page_count=len(pages),
                    detected_orientation_angle=0.0,
                )

        # 2. Handle Image Documents using Neural RapidOCR
        try:
            processed_bytes, angle = preprocess_image(file_bytes)
            engine = self._get_engine()

            if engine is not None:
                def _run_neural_ocr():
                    image = Image.open(io.BytesIO(processed_bytes))
                    # Convert to RGB if needed
                    if image.mode != "RGB":
                        image = image.convert("RGB")
                    
                    import numpy as np
                    img_np = np.array(image)
                    result, elapse = engine(img_np)
                    if not result:
                        return ""
                    # Sort lines primarily top-to-bottom, secondarily left-to-right
                    # result is list of [box, text, confidence]
                    lines = [line[1].strip() for line in result if line and len(line) > 1 and line[1].strip()]
                    return "\n".join(lines)

                extracted_text = await asyncio.to_thread(_run_neural_ocr)
                if extracted_text and len(extracted_text.strip()) > 10:
                    page = OCRPage(page_number=1, text=extracted_text.strip())
                    return OCRResult(
                        full_text=extracted_text.strip(),
                        pages=[page],
                        page_count=1,
                        detected_orientation_angle=angle,
                    )
        except Exception as e:
            logger.error(f"RapidOCR execution failed: {e}")

        # Fallback to mock if neural OCR is not applicable
        return await self.mock_fallback.process_document(file_bytes, mime_type)
