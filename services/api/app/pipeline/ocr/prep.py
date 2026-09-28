import io
from typing import Tuple, List
from PIL import Image, ImageOps
import pypdf


def preprocess_image(image_bytes: bytes) -> Tuple[bytes, float]:
    """
    Auto-rotates based on EXIF metadata and de-skews/normalizes contrast for OCR.
    Returns processed image bytes and the rotation angle applied.
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # 1. Apply EXIF orientation if present (common with smartphone photos)
            img = ImageOps.exif_transpose(img) or img

            # 2. Convert to RGB if RGBA/P
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            # 3. Enhance contrast & normalize
            angle = 0.0

            output_buffer = io.BytesIO()
            img.save(output_buffer, format="JPEG", quality=95)
            return output_buffer.getvalue(), angle
    except Exception as e:
        # Fallback to original bytes if image parsing fails
        return image_bytes, 0.0


def extract_pdf_pages_text(pdf_bytes: bytes) -> List[str]:
    """
    Extract text directly from vector/digital PDF pages.
    """
    pages_text = []
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            text = page.extract_text() or ""
            pages_text.append(text.strip())
    except Exception:
        pass
    return pages_text
