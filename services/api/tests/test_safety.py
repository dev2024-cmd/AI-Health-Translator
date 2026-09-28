import pytest
from app.pipeline.safety.guardrail import (
    check_clinical_safety,
    sanitize_and_guard,
    MANDATORY_DISCLAIMER
)


def test_safety_catches_diagnostic_assertions():
    unsafe_text = "Based on this report, you have anemia and you are suffering from kidney disease."
    is_safe, violations = check_clinical_safety(unsafe_text)
    assert not is_safe
    assert len(violations) >= 1
    assert any("Prohibited diagnostic assertion" in v for v in violations)


def test_safety_catches_prescription_and_dosage_advice():
    unsafe_text = "You should take 500mg metformin tablets twice daily and start taking insulin."
    is_safe, violations = check_clinical_safety(unsafe_text)
    assert not is_safe
    assert any("Prohibited prescription/dosage advice" in v for v in violations)


def test_safety_sanitizes_prohibited_diagnoses_and_prescriptions():
    raw_text = "You have anemia. Take 500mg iron tablets daily."
    sanitized = sanitize_and_guard(raw_text)

    # Diagnoses and prescriptions neutralized
    assert "you have anemia" not in sanitized.lower()
    assert "Take 500mg" not in sanitized
    assert "Discuss with your doctor" in sanitized or "Consult your" in sanitized

    # Mandatory disclaimer present
    assert MANDATORY_DISCLAIMER in sanitized


def test_mandatory_disclaimer_always_appended():
    safe_text = "Your blood count values are completely normal."
    sanitized = sanitize_and_guard(safe_text)
    assert MANDATORY_DISCLAIMER in sanitized
    assert "IMPORTANT MEDICAL DISCLAIMER" in sanitized
