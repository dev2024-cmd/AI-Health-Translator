"""
Deterministic Rules-Based Flagging Engine.
Evaluates clinical lab values against standard reference ranges and emergency panic bounds.
CRITICAL MANDATE: Flagging is strictly rules-based and deterministic. Never decided by an LLM.
"""

from typing import Dict, Any, Optional, Tuple

# Emergency panic thresholds for critical alerts
# Values outside these bounds represent medical emergencies requiring immediate clinical triage.
PANIC_THRESHOLDS: Dict[str, Dict[str, Any]] = {
    "potassium": {
        "aliases": ["potassium", "k+", "serum potassium"],
        "critical_low": 2.8,
        "critical_high": 6.2,
        "unit": "mmol/l",
        "reason": "Severe cardiac arrhythmia risk"
    },
    "glucose": {
        "aliases": ["glucose", "fasting blood sugar", "random blood sugar", "fbs", "rbs", "blood glucose"],
        "critical_low": 50.0,
        "critical_high": 400.0,
        "unit": "mg/dl",
        "reason": "Severe hypoglycemia / diabetic ketoacidosis risk"
    },
    "hemoglobin": {
        "aliases": ["hemoglobin", "hb", "haemoglobin", "hgb"],
        "critical_low": 7.0,
        "critical_high": 20.0,
        "unit": "g/dl",
        "reason": "Severe acute anemia / hyperviscosity risk"
    },
    "platelets": {
        "aliases": ["platelet", "platelet count", "platelets", "plt"],
        "critical_low": 25000.0,
        "critical_high": 1000000.0,
        "unit": "/mcl",
        "reason": "Spontaneous hemorrhage / thrombotic risk"
    },
    "sodium": {
        "aliases": ["sodium", "na+", "serum sodium"],
        "critical_low": 120.0,
        "critical_high": 160.0,
        "unit": "mmol/l",
        "reason": "Cerebral edema / severe hyperosmolar risk"
    },
    "calcium": {
        "aliases": ["calcium", "serum calcium", "ca"],
        "critical_low": 6.5,
        "critical_high": 13.0,
        "unit": "mg/dl",
        "reason": "Tetany / hypercalcemic crisis risk"
    },
    "creatinine": {
        "aliases": ["creatinine", "serum creatinine"],
        "critical_low": None,
        "critical_high": 5.0,
        "unit": "mg/dl",
        "reason": "Acute kidney failure / uremic crisis risk"
    },
    "wbc": {
        "aliases": ["wbc", "wbc count", "white blood cells", "total leukocyte count", "tlc"],
        "critical_low": 1500.0,
        "critical_high": 35000.0,
        "unit": "cells/mcl",
        "reason": "Severe agranulocytosis / leukemoid reaction or acute infection"
    },
    "troponin": {
        "aliases": ["troponin", "troponin i", "troponin t", "trop-i", "trop-t"],
        "critical_low": None,
        "critical_high": 0.04,
        "unit": "ng/ml",
        "reason": "Myocardial injury / acute coronary syndrome risk"
    },
    "bilirubin": {
        "aliases": ["bilirubin", "total bilirubin", "serum bilirubin"],
        "critical_low": None,
        "critical_high": 15.0,
        "unit": "mg/dl",
        "reason": "Acute hepatic decompensation / kernicterus risk"
    }
}


def _match_panic_rule(test_name: str) -> Optional[Dict[str, Any]]:
    """Checks if the test matches any known panic threshold definition."""
    normalized = test_name.strip().lower()
    for rule in PANIC_THRESHOLDS.values():
        for alias in rule["aliases"]:
            if alias == normalized or alias in normalized:
                return rule
    return None


def evaluate_flag(
    test_name: str,
    value: float,
    unit: str,
    ref_low: Optional[float] = None,
    ref_high: Optional[float] = None
) -> Tuple[str, Optional[str]]:
    """
    Deterministically computes flag ('normal', 'low', 'high', 'critical') and optional reasoning.
    
    1. Checks emergency panic limits.
    2. Compares against reference ranges.
    3. Returns flag and reason.
    """
    panic_rule = _match_panic_rule(test_name)
    if panic_rule:
        crit_low = panic_rule.get("critical_low")
        crit_high = panic_rule.get("critical_high")

        if crit_low is not None and value < crit_low:
            return "critical", f"Value {value} is dangerously below panic threshold ({crit_low}): {panic_rule['reason']}"
        if crit_high is not None and value > crit_high:
            return "critical", f"Value {value} is dangerously above panic threshold ({crit_high}): {panic_rule['reason']}"

    # Standard reference range check
    if ref_low is not None and ref_high is not None:
        if value < ref_low:
            return "low", f"Value {value} is below normal reference range ({ref_low} - {ref_high})"
        elif value > ref_high:
            return "high", f"Value {value} is above normal reference range ({ref_low} - {ref_high})"
        else:
            return "normal", None

    if ref_low is not None and value < ref_low:
        return "low", f"Value {value} is below normal minimum ({ref_low})"

    if ref_high is not None and value > ref_high:
        return "high", f"Value {value} is above normal maximum ({ref_high})"

    return "normal", None
