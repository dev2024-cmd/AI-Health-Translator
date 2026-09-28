import io
from app.pipeline.base import BaseOCRProvider, OCRResult, OCRPage
from app.pipeline.ocr.prep import preprocess_image, extract_pdf_pages_text


SAMPLE_CBC_REPORT_TEXT = """
APEX DIAGNOSTIC LABORATORIES
Patient Name: Sita Ramulu | Age: 64 | Gender: Male
Report Date: 2026-09-28 | Ref By: Dr. A. Sharma

COMPLETE BLOOD COUNT (CBC)
------------------------------------------------------------
Test Description           Result   Units      Reference Range
------------------------------------------------------------
Hemoglobin                 11.2     g/dL       13.0 - 17.0
RBC Count                  4.1      mil/uL     4.5 - 5.5
WBC Count (TLC)            8500     cells/mcL  4000 - 11000
Platelet Count             180000   /mcL       150000 - 450000
Packed Cell Volume (PCV)   34.5     %          40.0 - 50.0
Mean Corpuscular Vol (MCV) 82.0     fL         80.0 - 100.0
Neutrophils                62       %          40 - 75
Lymphocytes                30       %          20 - 45
Monocytes                  5        %          2 - 10
Eosinophils                3        %          1 - 6
Basophils                  0        %          0 - 2
------------------------------------------------------------
Verified by Chief Pathologist
"""

SAMPLE_LIPID_REPORT_TEXT = """
APEX DIAGNOSTIC LABORATORIES
Patient Name: Ramesh Patel | Age: 58 | Gender: Male
Report Date: 2026-09-28

LIPID PROFILE - SERUM
------------------------------------------------------------
Test Description           Result   Units      Reference Range
------------------------------------------------------------
Total Cholesterol          235.0    mg/dL      125.0 - 200.0
Triglycerides              190.0    mg/dL      50.0 - 150.0
HDL Cholesterol            38.0     mg/dL      40.0 - 60.0
LDL Cholesterol            152.0    mg/dL      0.0 - 100.0
VLDL Cholesterol           38.0     mg/dL      10.0 - 30.0
------------------------------------------------------------
End of Report - Page 1 of 1
"""


class MockOCRProvider(BaseOCRProvider):
    """
    Mock OCR provider that parses digital PDFs or returns realistic synthetic clinical lab text.
    """
    async def process_document(self, file_bytes: bytes, mime_type: str) -> OCRResult:
        # Preprocess image to test rotation logic
        angle = 0.0
        if "pdf" not in mime_type:
            _, angle = preprocess_image(file_bytes)

        # If it's a PDF with embedded text, extract it
        if "pdf" in mime_type:
            pdf_pages = extract_pdf_pages_text(file_bytes)
            if pdf_pages and any(len(p) > 20 for p in pdf_pages):
                pages = [OCRPage(page_number=i+1, text=p) for i, p in enumerate(pdf_pages)]
                return OCRResult(
                    full_text="\n\n".join(pdf_pages),
                    pages=pages,
                    page_count=len(pages),
                    detected_orientation_angle=0.0,
                )

        # Default realistic clinical synthetic output
        # If byte length has an odd sum, pick Lipid, otherwise CBC for variety
        report_text = SAMPLE_CBC_REPORT_TEXT if len(file_bytes) % 2 == 0 else SAMPLE_LIPID_REPORT_TEXT

        page = OCRPage(page_number=1, text=report_text.strip())
        return OCRResult(
            full_text=report_text.strip(),
            pages=[page],
            page_count=1,
            detected_orientation_angle=angle,
        )
