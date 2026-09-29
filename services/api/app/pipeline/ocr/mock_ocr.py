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

SAMPLE_PRESCRIPTION_TEXT = """
CLINICAL PRESCRIPTION
Name: Lolita Alvarez
Address: Bagong Ilog, Pasig City
Age: 39 | Sex: Female | Date: 2026-09-28

Rx:
1. FeSO4 (Ferrous Sulfate) tab #30
   Sig: O.D. (Take 1 tablet daily with a glass of water)
2. Ascorbic Acid (Vitamin C 100mg) tab #30
   Sig: Once a day (Take with iron tablet)

Physician: Dr. Jdelacruz, MD
Lic. No: 12345 | PTR No: 1234567
"""

SAMPLE_DEMO_PRESCRIPTION_TEXT = """
Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)
Consultant Physician, City Health Clinic, Pune
Reg No: MH-48291 | Date: 02-05-2020

Patient Name: Rajesh Kumar | Age: 42 | Gender: Male

Rx:
1. TAB. DEMO MEDICINE 1
   1 Morning, 1 Night - Before Food x 10 days
2. CAP. DEMO MEDICINE 2
   1 Morning - Before Food x 10 days
3. TAB. DEMO MEDICINE 3
   1 Morning, 1 Aft, 1 Eve, 1 Night - After Food x 10 days
4. TAB. DEMO MEDICINE 4
   1/2 Morning, 1/2 Night - After Food x 10 days

Dietary & Lifestyle Advice:
AVOID OILY AND SPICY FOOD. Drink 3L boiled water daily.

Follow-up Date: 12-05-2020
"""

SAMPLE_LIPID_REPORT_TEXT = """
APEX DIAGNOSTIC LABORATORIES
Patient Name: Sita Ramulu | Age: 64 | Gender: Male
Report Date: 2026-09-28 | Ref By: Dr. A. Sharma

LIPID PROFILE
------------------------------------------------------------
Test Description           Result   Units      Reference Range
------------------------------------------------------------
Total Cholesterol          245      mg/dL      125 - 200
Triglycerides              190      mg/dL      < 150
HDL Cholesterol            38       mg/dL      > 40
LDL Cholesterol            168      mg/dL      < 100
VLDL Cholesterol           38       mg/dL      < 30
------------------------------------------------------------
Verified by Chief Pathologist
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

        # Intelligent content-aware text matching
        try:
            raw_sample = file_bytes[:4000].decode("latin-1", errors="ignore").lower()
            if any(k in raw_sample for k in ("demo", "sharma", "oily", "spicy")):
                report_text = SAMPLE_DEMO_PRESCRIPTION_TEXT
            elif any(k in raw_sample for k in ("prescription", "rx", "tab", "cap", "doctor", "ascorbic", "ibuprofen", "dr.")):
                report_text = SAMPLE_DEMO_PRESCRIPTION_TEXT
            elif len(file_bytes) % 2 == 0:
                report_text = SAMPLE_CBC_REPORT_TEXT
            else:
                report_text = SAMPLE_LIPID_REPORT_TEXT
        except Exception:
            report_text = SAMPLE_DEMO_PRESCRIPTION_TEXT if len(file_bytes) % 2 == 0 else SAMPLE_CBC_REPORT_TEXT

        page = OCRPage(page_number=1, text=report_text.strip())
        return OCRResult(
            full_text=report_text.strip(),
            pages=[page],
            page_count=1,
            detected_orientation_angle=angle,
        )

