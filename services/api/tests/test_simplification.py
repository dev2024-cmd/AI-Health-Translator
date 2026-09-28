import pytest
from app.pipeline.simplification.deterministic import DeterministicSimplifier
from app.models.extracted_value import ExtractedValue


@pytest.mark.asyncio
async def test_deterministic_simplifier_formats_grade5_and_brackets_terms():
    simplifier = DeterministicSimplifier()

    rows = [
        ExtractedValue(
            id="1",
            test_name="Hemoglobin",
            value=10.5,
            unit="g/dL",
            ref_low=13.0,
            ref_high=17.0,
            flag="low"
        ),
        ExtractedValue(
            id="2",
            test_name="Platelet Count",
            value=250000.0,
            unit="/mcL",
            ref_low=150000.0,
            ref_high=450000.0,
            flag="normal"
        )
    ]

    patient_info = {"name": "Sita Ramulu"}
    result = await simplifier.simplify_report(rows, patient_info=patient_info)

    # Friendly greeting
    assert "Sita Ramulu" in result.plain_text

    # Original English terms preserved in brackets
    assert "[Hemoglobin]" in result.plain_text
    assert "[Platelet Count]" in result.plain_text

    # Analogy from glossary included (e.g. oxygen delivery boats / band-aids)
    assert "oxygen" in result.plain_text.lower()

    # Mandatory disclaimer present
    assert "IMPORTANT MEDICAL DISCLAIMER" in result.plain_text


@pytest.mark.asyncio
async def test_deterministic_simplifier_highlights_critical_values():
    simplifier = DeterministicSimplifier()

    rows = [
        ExtractedValue(
            id="crit-1",
            test_name="Potassium",
            value=6.8,
            unit="mmol/L",
            ref_low=3.5,
            ref_high=5.0,
            flag="critical"
        )
    ]

    result = await simplifier.simplify_report(rows)
    assert "IMPORTANT NOTICE" in result.plain_text or "URGENT" in result.plain_text
    assert "[Potassium]" in result.plain_text
    assert "6.8 mmol/L" in result.plain_text
    assert "doctor or community health worker" in result.plain_text
