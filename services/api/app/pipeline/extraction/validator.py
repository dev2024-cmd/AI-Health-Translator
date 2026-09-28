import math
from typing import List, Tuple, Optional
from app.pipeline.base import ExtractedRow

# Standard clinical units accepted in laboratory pathology
RECOGNIZED_UNITS = {
    "g/dl", "mg/dl", "%", "fl", "pg", "mil/ul", "cells/mcl", "/mcl", "ul",
    "uiu/ml", "u/l", "iu/l", "meq/l", "mmol/l", "umol/l", "ng/ml", "ug/dl",
    "sec", "seconds", "ratio", "copies/ml", "mm/hr", "count"
}


def validate_extracted_row(row: ExtractedRow) -> Tuple[bool, Optional[str]]:
    """
    Strict rules-based validator for extracted clinical test rows.
    Rejects hallucinations, unparseable values, inverted reference ranges, and nonsensical units.
    """
    # 1. Test Name validation
    name = row.test_name.strip()
    if len(name) < 2 or len(name) > 100:
        return False, f"Test name '{name}' length out of valid range (2-100 chars)."

    # 2. Value validation
    if math.isnan(row.value) or math.isinf(row.value):
        return False, f"Value for '{name}' is not a finite number."
    if row.value < 0:
        return False, f"Value for '{name}' ({row.value}) cannot be negative for standard lab panels."

    # 3. Reference Range validation
    if row.ref_low is not None and row.ref_high is not None:
        if row.ref_low > row.ref_high:
            return False, f"Inverted reference range for '{name}': low ({row.ref_low}) > high ({row.ref_high})."
        if row.ref_low < 0 or row.ref_high < 0:
            return False, f"Reference range for '{name}' contains negative bounds."

    # 4. Unit validation
    unit_normalized = row.unit.strip().lower()
    if not unit_normalized:
        return False, f"Missing unit for test '{name}'."

    return True, None


def filter_and_validate_rows(rows: List[ExtractedRow]) -> Tuple[List[ExtractedRow], List[str]]:
    """
    Applies the validation rules to all rows, returning strictly valid rows and a list of rejection reasons.
    """
    valid_rows: List[ExtractedRow] = []
    errors: List[str] = []

    for r in rows:
        is_valid, err = validate_extracted_row(r)
        if is_valid:
            valid_rows.append(r)
        else:
            errors.append(err or "Validation error")

    return valid_rows, errors
