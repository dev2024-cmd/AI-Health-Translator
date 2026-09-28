"""
Document-Type Auto-Detection Engine.
Classifies clinical documents into 'lab_report' or 'prescription' based on OCR text features.
"""

import re


PRESCRIPTION_PATTERNS = [
    re.compile(r"\b(?:rx|℞)\b", re.IGNORECASE),
    re.compile(r"\b(?:prescription|prescribed|prescribe)\b", re.IGNORECASE),
    re.compile(r"\b(?:dr\.|doctor|m\.?d\.?|m\.?b\.?b\.?s\.?|physician|clinic)\b", re.IGNORECASE),
    re.compile(r"\b(?:tab|tablet|cap|capsule|syrup|syp|injection|inj|drops|ointment)\b", re.IGNORECASE),
    re.compile(r"\b(?:\d+\s*mg|\d+\s*ml|\d+\s*mcg)\b", re.IGNORECASE),
    re.compile(r"\b(?:1-0-1|0-1-0|1-1-1|0-0-1|1-0-0|once daily|twice daily|thrice daily|bd|od|tds|tid|qid|hs)\b", re.IGNORECASE),
    re.compile(r"\b(?:after food|before food|with meals|empty stomach|bedtime)\b", re.IGNORECASE),
    re.compile(r"\b(?:for \d+ days|x \d+ days|\d+ days duration)\b", re.IGNORECASE),
    re.compile(r"\b(?:signature|reg\.?\s*no\.?)\b", re.IGNORECASE),
]

LAB_REPORT_PATTERNS = [
    re.compile(r"\b(?:laboratory|diagnostic|pathology|specimen|sample)\b", re.IGNORECASE),
    re.compile(r"\b(?:reference range|biological ref|normal range|units)\b", re.IGNORECASE),
    re.compile(r"\b(?:hemoglobin|rbc|wbc|platelet|cholesterol|triglycerides|creatinine|bilirubin|glucose|hba1c)\b", re.IGNORECASE),
    re.compile(r"\b(?:complete blood count|cbc|lipid profile|liver function|lft|kft)\b", re.IGNORECASE),
    re.compile(r"\b(?:test description|test name|investigation|observed value)\b", re.IGNORECASE),
]


def detect_document_type(text: str) -> str:
    """
    Analyzes OCR text and returns 'prescription' or 'lab_report'.
    """
    if not text or not text.strip():
        return "lab_report"

    prescription_score = 0
    for pattern in PRESCRIPTION_PATTERNS:
        matches = pattern.findall(text)
        prescription_score += len(matches)

    lab_score = 0
    for pattern in LAB_REPORT_PATTERNS:
        matches = pattern.findall(text)
        lab_score += len(matches)

    # Specific strong indicators
    has_rx_symbol = bool(re.search(r"\b(?:rx|℞)\b", text, re.IGNORECASE))
    has_dosage_schedule = bool(re.search(r"\b(?:1-0-1|0-1-0|1-1-1|0-0-1|after food|before food)\b", text, re.IGNORECASE))
    has_lab_table = bool(re.search(r"reference\s+range", text, re.IGNORECASE))

    if has_rx_symbol or has_dosage_schedule:
        prescription_score += 5
    if has_lab_table:
        lab_score += 5

    return "prescription" if prescription_score > lab_score else "lab_report"
