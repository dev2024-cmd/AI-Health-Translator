import pytest
from app.pipeline.flagging.evaluator import evaluate_flag, PANIC_THRESHOLDS


def test_flag_normal_range():
    flag, reason = evaluate_flag(
        test_name="Hemoglobin",
        value=14.2,
        unit="g/dL",
        ref_low=13.0,
        ref_high=17.0
    )
    assert flag == "normal"
    assert reason is None


def test_flag_low_value():
    flag, reason = evaluate_flag(
        test_name="Hemoglobin",
        value=11.5,
        unit="g/dL",
        ref_low=13.0,
        ref_high=17.0
    )
    assert flag == "low"
    assert "below normal reference range" in reason


def test_flag_high_value():
    flag, reason = evaluate_flag(
        test_name="Total Cholesterol",
        value=245.0,
        unit="mg/dL",
        ref_low=125.0,
        ref_high=200.0
    )
    assert flag == "high"
    assert "above normal reference range" in reason


def test_flag_critical_potassium_low_and_high():
    # Normal is ~3.5 - 5.0
    # Below 2.8 is panic low
    flag_low, reason_low = evaluate_flag(
        test_name="Serum Potassium (K+)",
        value=2.4,
        unit="mmol/L",
        ref_low=3.5,
        ref_high=5.0
    )
    assert flag_low == "critical"
    assert "panic threshold" in reason_low

    # Above 6.2 is panic high
    flag_high, reason_high = evaluate_flag(
        test_name="Potassium",
        value=6.7,
        unit="mmol/L",
        ref_low=3.5,
        ref_high=5.0
    )
    assert flag_high == "critical"
    assert "panic threshold" in reason_high


def test_flag_critical_glucose():
    # Above 400 is panic high
    flag_crit, reason = evaluate_flag(
        test_name="Fasting Blood Sugar",
        value=450.0,
        unit="mg/dL",
        ref_low=70.0,
        ref_high=100.0
    )
    assert flag_crit == "critical"
    assert "panic threshold" in reason

    # Below 50 is panic low
    flag_hypo, _ = evaluate_flag(
        test_name="Glucose",
        value=42.0,
        unit="mg/dL",
        ref_low=70.0,
        ref_high=100.0
    )
    assert flag_hypo == "critical"


def test_flag_critical_platelets():
    # Below 25,000 is panic low
    flag, reason = evaluate_flag(
        test_name="Platelet Count",
        value=18000.0,
        unit="/mcL",
        ref_low=150000.0,
        ref_high=450000.0
    )
    assert flag == "critical"
    assert "panic threshold" in reason


def test_deterministic_repeatability():
    # Must yield identical result across 50 runs
    results = [
        evaluate_flag("Hemoglobin", 10.5, "g/dL", 13.0, 17.0)
        for _ in range(50)
    ]
    assert all(r == ("low", "Value 10.5 is below normal reference range (13.0 - 17.0)") for r in results)
