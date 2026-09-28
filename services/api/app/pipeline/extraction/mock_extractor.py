import re
from typing import List
from app.pipeline.base import BaseExtractionProvider, OCRResult, ExtractedRow, ExtractionResult
from app.pipeline.extraction.validator import filter_and_validate_rows


# Standard regex to match table lines: e.g. "Hemoglobin 11.2 g/dL 13.0 - 17.0"
LINE_PATTERN = re.compile(
    r"^(?P<name>[A-Za-z0-9\s\(\)]+?)\s{2,}(?P<val>\d+(?:\.\d+)?)\s+(?P<unit>[^\d\s][\w\/%]+)\s+(?P<low>\d+(?:\.\d+)?)\s*[-–]\s*(?P<high>\d+(?:\.\d+)?)"
)


class MockExtractionProvider(BaseExtractionProvider):
    """
    Mock & Regex-based extraction provider that parses clinical text tables into structured rows.
    """
    async def extract_values(self, ocr_result: OCRResult) -> ExtractionResult:
        raw_rows: List[ExtractedRow] = []

        for page in ocr_result.pages:
            lines = page.text.split("\n")
            for line in lines:
                line_str = line.strip()
                if not line_str or "Test Description" in line_str or "---" in line_str:
                    continue

                match = LINE_PATTERN.match(line_str)
                if match:
                    try:
                        raw_rows.append(
                            ExtractedRow(
                                test_name=match.group("name").strip(),
                                value=float(match.group("val")),
                                unit=match.group("unit").strip(),
                                ref_low=float(match.group("low")),
                                ref_high=float(match.group("high")),
                                page=page.page_number,
                            )
                        )
                    except ValueError:
                        continue

        # If regex parsed rows, validate them
        if raw_rows:
            valid_rows, errors = filter_and_validate_rows(raw_rows)
            return ExtractionResult(rows=valid_rows, validation_errors=errors)

        # Fallback starter set for testing if text was unstructured
        fallback_rows = [
            ExtractedRow(test_name="Hemoglobin", value=11.2, unit="g/dL", ref_low=13.0, ref_high=17.0, page=1),
            ExtractedRow(test_name="WBC Count", value=8500.0, unit="cells/mcL", ref_low=4000.0, ref_high=11000.0, page=1),
            ExtractedRow(test_name="Platelet Count", value=180000.0, unit="/mcL", ref_low=150000.0, ref_high=450000.0, page=1),
        ]
        valid_rows, errors = filter_and_validate_rows(fallback_rows)
        return ExtractionResult(rows=valid_rows, validation_errors=errors)
