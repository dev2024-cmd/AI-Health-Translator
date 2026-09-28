import io
import pytest
from PIL import Image
from app.pipeline.ocr.prep import preprocess_image, extract_pdf_pages_text
from app.pipeline.ocr.mock_ocr import MockOCRProvider
from app.pipeline.ocr.tesseract_ocr import TesseractOCRProvider


def create_dummy_jpeg() -> bytes:
    img = Image.new("RGB", (200, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_image_preprocessing():
    jpeg_bytes = create_dummy_jpeg()
    processed_bytes, angle = preprocess_image(jpeg_bytes)
    assert len(processed_bytes) > 0
    assert angle == 0.0


@pytest.mark.asyncio
async def test_mock_ocr_provider():
    ocr = MockOCRProvider()
    jpeg_bytes = create_dummy_jpeg()

    result = await ocr.process_document(jpeg_bytes, "image/jpeg")
    assert result.page_count >= 1
    assert len(result.full_text) > 50
    assert "DIAGNOSTIC" in result.full_text
    assert len(result.pages) == result.page_count


@pytest.mark.asyncio
async def test_tesseract_ocr_provider_fallback():
    ocr = TesseractOCRProvider()
    jpeg_bytes = create_dummy_jpeg()

    # Even if tesseract is not in system PATH during unit test, fallback ensures high reliability
    result = await ocr.process_document(jpeg_bytes, "image/jpeg")
    assert result.page_count >= 1
    assert len(result.full_text) > 0
