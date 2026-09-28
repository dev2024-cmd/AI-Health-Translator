"""
Clinical Safety & Guardrail Engine.
Strictly prohibits automated diagnosis and medication prescriptions.
Enforces India DPDP & Clinical Safety Compliance.
"""

import re
from typing import Tuple, List

MANDATORY_DISCLAIMER = (
    "IMPORTANT MEDICAL DISCLAIMER: This explanation is provided strictly for educational "
    "and informational purposes. It does NOT provide a medical diagnosis, clinical evaluation, "
    "or prescription. Normal ranges vary across laboratories. Please consult a qualified doctor "
    "or community health worker to review your symptoms and test results."
)

# Regex patterns that indicate diagnostic assertions
DIAGNOSIS_PATTERNS = [
    re.compile(r"\b(?:you|patient)\s+(?:have|has|are suffering from|suffer from)\s+([a-zA-Z\s]+)", re.IGNORECASE),
    re.compile(r"\b(?:diagnosed with|diagnosis of|diagnosis:)\s+([a-zA-Z\s]+)", re.IGNORECASE),
    re.compile(r"\b(?:you are diabetic|you have diabetes|you have anemia|you have kidney failure|you have liver disease)\b", re.IGNORECASE),
    re.compile(r"\b(?:this indicates you suffer from|this confirms you have)\b", re.IGNORECASE),
]

# Regex patterns that indicate medication/dosage prescriptions
PRESCRIPTION_PATTERNS = [
    re.compile(r"\b(?:take|prescribe|administer|consume)\s+\d+\s*(?:mg|g|ml|tablets|pills|capsules|drops)\b", re.IGNORECASE),
    re.compile(r"\b(?:inject|dose of|dosage of)\s+([a-zA-Z0-9\s]+)", re.IGNORECASE),
    re.compile(r"\b(?:start taking|stop taking|discontinue)\s+(?:medication|medicine|tablets|drugs|insulin)\b", re.IGNORECASE),
    re.compile(r"\b(?:take\s+(?:metformin|paracetamol|aspirin|atorvastatin|amoxicillin|insulin))\b", re.IGNORECASE),
]


def check_clinical_safety(text: str) -> Tuple[bool, List[str]]:
    """
    Scans text for prohibited medical diagnoses or prescription advice.
    Returns (is_safe, list_of_violations).
    """
    violations = []

    for pattern in DIAGNOSIS_PATTERNS:
        match = pattern.search(text)
        if match:
            violations.append(f"Prohibited diagnostic assertion: '{match.group(0)}'")

    for pattern in PRESCRIPTION_PATTERNS:
        match = pattern.search(text)
        if match:
            violations.append(f"Prohibited prescription/dosage advice: '{match.group(0)}'")

    is_safe = len(violations) == 0
    return is_safe, violations


def sanitize_and_guard(text: str) -> str:
    """
    Sanitizes generated explanation text:
    1. Neutralizes diagnostic assertions into factual observational statements.
    2. Removes any dosage/prescription language.
    3. Ensures the mandatory non-diagnostic disclaimer is appended.
    """
    sanitized = text

    # Transform common prohibited phrases into neutral observational phrasing
    replacements = [
        (re.compile(r"\byou have anemia\b", re.IGNORECASE), "your hemoglobin level is lower than the standard reference range"),
        (re.compile(r"\byou have diabetes\b", re.IGNORECASE), "your blood sugar level is elevated above standard fasting limits"),
        (re.compile(r"\byou are suffering from ([a-zA-Z\s]+)", re.IGNORECASE), r"your tests indicate values related to \1"),
        (re.compile(r"\bdiagnosed with ([a-zA-Z\s]+)", re.IGNORECASE), r"tested for values related to \1"),
        (re.compile(r"\btake \d+\s*(?:mg|tablets|pills|capsules)[^.]*\.", re.IGNORECASE), "Discuss with your doctor whether any medication is appropriate."),
        (re.compile(r"\bstart taking [^.]*\.", re.IGNORECASE), "Consult your healthcare provider regarding treatments."),
    ]

    for pattern, replacement in replacements:
        sanitized = pattern.sub(replacement, sanitized)

    # Clean double spaces
    sanitized = re.sub(r"\s+", " ", sanitized).strip()

    # Append mandatory disclaimer if not already present
    if "IMPORTANT MEDICAL DISCLAIMER" not in sanitized:
        sanitized = f"{sanitized}\n\n{MANDATORY_DISCLAIMER}"

    return sanitized
