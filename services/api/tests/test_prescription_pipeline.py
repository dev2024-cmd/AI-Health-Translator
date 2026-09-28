import pytest
from app.pipeline.ocr.detector import detect_document_type
from app.pipeline.prescription.schemas import PrescribedMedication
from app.pipeline.prescription.extractor import PrescriptionExtractor
from app.pipeline.prescription.interactions import check_drug_interactions
from app.pipeline.prescription.explainer import generate_prescription_explanation


SAMPLE_PRESCRIPTION_TEXT = """
Dr. R. K. Sharma, MD (Internal Medicine)
Apollo Clinic, Jubilee Hills, Hyderabad
Reg No: TS-48921 | Date: 2026-09-28
Patient: Sita Ramulu | Age: 64

Rx:
1. Tab. Metformin 500mg - 1-0-1 - After food x 30 days
2. Tab. Telmisartan 40mg - 1-0-0 - Before food x 30 days
3. Tab. Atorvastatin 10mg - 0-0-1 - Bedtime x 30 days
4. Tab. Paracetamol 650mg - 1-0-1 - After food SOS for fever

Instructions:
Take medicines regularly. Drink 2-3 liters of water daily.
Doctor's Signature: Dr. R. K. Sharma
"""

SAMPLE_INTERACTION_PRESCRIPTION = """
Dr. Mehta, Cardiologist
Rx:
1. Tab. Aspirin 75mg - 1-0-0 - After food
2. Tab. Warfarin 2.5mg - 0-0-1 - Night after dinner
"""


def test_document_type_detection():
    # Prescription detection
    assert detect_document_type(SAMPLE_PRESCRIPTION_TEXT) == "prescription"
    assert detect_document_type(SAMPLE_INTERACTION_PRESCRIPTION) == "prescription"

    # Lab report detection
    lab_text = """
    APEX DIAGNOSTIC LABORATORIES
    COMPLETE BLOOD COUNT (CBC)
    Hemoglobin                 11.2     g/dL       13.0 - 17.0
    RBC Count                  4.1      mil/uL     4.5 - 5.5
    Reference Range: Biological limits
    """
    assert detect_document_type(lab_text) == "lab_report"


def test_prescription_extraction():
    extractor = PrescriptionExtractor()
    data = extractor.process_prescription(SAMPLE_PRESCRIPTION_TEXT)

    assert "Dr. R. K. Sharma" in data.doctor_name or "Sharma" in data.doctor_name
    assert len(data.medications) >= 3

    # Check Metformin extraction
    metformin = next((m for m in data.medications if "Metformin" in m.name), None)
    assert metformin is not None
    assert metformin.form == "Tablet"
    assert "morning" in metformin.daily_schedule.lower()
    assert "night" in metformin.daily_schedule.lower()
    assert "after" in metformin.daily_schedule.lower()


def test_drug_interaction_detection():
    extractor = PrescriptionExtractor()
    data = extractor.process_prescription(SAMPLE_INTERACTION_PRESCRIPTION)

    # Aspirin + Warfarin should trigger CRITICAL bleeding interaction alert
    assert len(data.interactions) >= 1
    interaction = data.interactions[0]
    assert interaction.severity in ("CRITICAL", "SEVERE")
    assert "bleeding" in interaction.description.lower() or "hemorrhage" in interaction.description.lower()


def test_safe_prescription_explanation_never_alters_dosage():
    extractor = PrescriptionExtractor()
    data = extractor.process_prescription(SAMPLE_PRESCRIPTION_TEXT)
    explanation = generate_prescription_explanation(data, patient_name="Sita Ramulu", language="en")

    # Must contain prominent doctor banner
    assert "Take this medicine only as prescribed by" in explanation
    assert "Dr. R. K. Sharma" in explanation or "Sharma" in explanation

    # Must contain schedule
    assert "Daily Medication Routine" in explanation
    assert "Metformin" in explanation

    # Must NOT advise changing dosage
    assert "change your dose" in explanation.lower() or "never change" in explanation.lower()

    # Must contain mandatory clinical disclaimer
    assert "IMPORTANT MEDICAL DISCLAIMER" in explanation


def test_telugu_localized_prescription_explanation():
    extractor = PrescriptionExtractor()
    data = extractor.process_prescription(SAMPLE_PRESCRIPTION_TEXT)
    explanation = generate_prescription_explanation(data, patient_name="Sita Ramulu", language="te")

    # Telugu doctor banner
    assert "ముఖ్య గమనిక" in explanation
    assert "మందుల మోతాదును ఎప్పుడూ మార్చకండి" in explanation
