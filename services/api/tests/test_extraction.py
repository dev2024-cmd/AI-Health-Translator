import pytest
from app.pipeline.base import ExtractedRow, OCRResult, OCRPage
from app.pipeline.extraction.validator import validate_extracted_row, filter_and_validate_rows
from app.pipeline.extraction.mock_extractor import MockExtractionProvider
from app.pipeline.ocr.mock_ocr import SAMPLE_CBC_REPORT_TEXT
from app.pipeline.extraction.llm_extractor import LLMExtractionProvider


def test_validator_accepts_valid_row():
    row = ExtractedRow(
        test_name="Hemoglobin",
        value=13.5,
        unit="g/dL",
        ref_low=12.0,
        ref_high=16.0,
        page=1,
    )
    is_valid, err = validate_extracted_row(row)
    assert is_valid is True
    assert err is None


def test_validator_rejects_inverted_reference_range():
    row = ExtractedRow(
        test_name="Hemoglobin",
        value=13.5,
        unit="g/dL",
        ref_low=16.0,
        ref_high=12.0,  # low > high
        page=1,
    )
    is_valid, err = validate_extracted_row(row)
    assert is_valid is False
    assert "Inverted" in err


def test_validator_rejects_negative_value():
    row = ExtractedRow(
        test_name="Platelets",
        value=-250000.0,
        unit="/mcL",
        ref_low=150000.0,
        ref_high=450000.0,
        page=1,
    )
    is_valid, err = validate_extracted_row(row)
    assert is_valid is False
    assert "negative" in err


def test_validator_rejects_missing_unit_or_name():
    row_no_unit = ExtractedRow(test_name="RBC Count", value=4.5, unit="")
    is_valid, err = validate_extracted_row(row_no_unit)
    assert is_valid is False

    row_short_name = ExtractedRow(test_name="X", value=4.5, unit="mg/dL")
    is_valid, err = validate_extracted_row(row_short_name)
    assert is_valid is False


@pytest.mark.asyncio
async def test_mock_extraction_parses_clinical_table():
    extractor = MockExtractionProvider()
    ocr_result = OCRResult(
        full_text=SAMPLE_CBC_REPORT_TEXT,
        pages=[OCRPage(page_number=1, text=SAMPLE_CBC_REPORT_TEXT)],
        page_count=1,
    )

    result = await extractor.extract_values(ocr_result)
    assert len(result.rows) >= 3
    test_names = [r.test_name for r in result.rows]
    assert any("Hemoglobin" in n for n in test_names)
    assert any("WBC" in n or "Platelet" in n for n in test_names)

    # Check units and values are parsed accurately
    hb_row = next(r for r in result.rows if "Hemoglobin" in r.test_name)
    assert hb_row.value == 11.2
    assert hb_row.unit == "g/dL"
    assert hb_row.ref_low == 13.0
    assert hb_row.ref_high == 17.0


@pytest.mark.asyncio
async def test_llm_extractor_integration():
    extractor = LLMExtractionProvider()
    ocr_result = OCRResult(
        full_text=SAMPLE_CBC_REPORT_TEXT,
        pages=[OCRPage(page_number=1, text=SAMPLE_CBC_REPORT_TEXT)],
        page_count=1,
    )
    result = await extractor.extract_values(ocr_result)
    assert len(result.rows) >= 3
    assert len(result.validation_errors) == 0
