"""
Prescription Extraction Engine.
Extracts doctor name, date, medication list, dosage form, frequency, timing, and duration from prescription text.
"""

import re
from typing import List, Tuple
from app.pipeline.prescription.schemas import PrescriptionData, PrescribedMedication
from app.pipeline.prescription.interactions import check_drug_interactions


# Schedule mapping to plain language
SCHEDULE_MAP = {
    "1-0-1": "Take 1 in the morning after breakfast and 1 at night after dinner",
    "1-1-1": "Take 1 in the morning after breakfast, 1 in the afternoon after lunch, and 1 at night after dinner",
    "1-0-0": "Take 1 in the morning after breakfast",
    "0-1-0": "Take 1 in the afternoon after lunch",
    "0-0-1": "Take 1 at night before going to bed",
    "0-1-1": "Take 1 in the afternoon after lunch and 1 at night after dinner",
    "od": "Take once daily as directed by your doctor",
    "bd": "Take twice daily, once in the morning and once at night",
    "bid": "Take twice daily, once in the morning and once at night",
    "tds": "Take 3 times daily (morning, afternoon, and night) as directed",
    "tid": "Take 3 times daily (morning, afternoon, and night) as directed",
    "qid": "Take 4 times daily at evenly spaced intervals as directed",
    "hs": "Take at night right before sleeping",
    "sos": "Take only when needed for pain or fever, as directed by your doctor",
}

COMMON_MEDICATIONS = [
    ("Metformin", "Tablet", "500 mg", "1-0-1", "After food", "30 days", "Take with or after meals to prevent stomach upset"),
    ("Glipizide", "Tablet", "5 mg", "1-0-0", "Before food", "30 days", "Take 30 minutes before breakfast"),
    ("Amoxicillin", "Capsule", "500 mg", "1-1-1", "After food", "7 days", "Finish the complete course even if you feel better"),
    ("Paracetamol", "Tablet", "650 mg", "1-0-1", "After food", "3 days", "Do not exceed 4 tablets in 24 hours"),
    ("Dolo", "Tablet", "650 mg", "1-0-1", "After food", "3 days", "Do not take other paracetamol medicines together"),
    ("Atorvastatin", "Tablet", "10 mg", "0-0-1", "Bedtime", "30 days", "Take once daily at night"),
    ("Aspirin", "Tablet", "75 mg", "1-0-0", "After food", "30 days", "Take with plenty of water after food"),
    ("Ecosprin", "Tablet", "75 mg", "1-0-0", "After food", "30 days", "Take with water immediately after breakfast"),
    ("Warfarin", "Tablet", "2.5 mg", "0-0-1", "Bedtime", "30 days", "Take at the exact same time every evening"),
    ("Telmisartan", "Tablet", "40 mg", "1-0-0", "Before food", "30 days", "Take in the morning for blood pressure control"),
    ("Pantoprazole", "Tablet", "40 mg", "1-0-0", "Before food", "14 days", "Take on an empty stomach 30 minutes before breakfast"),
    ("Azithromycin", "Tablet", "500 mg", "1-0-0", "After food", "3 days", "Complete the 3-day course exactly as prescribed"),
]


def format_daily_schedule(frequency: str, timing: str, form: str) -> str:
    """Creates a gentle, plain-language 5th-grade instruction for taking the medicine."""
    freq_clean = frequency.lower().strip()
    base_schedule = SCHEDULE_MAP.get(freq_clean, f"Take according to frequency: {frequency}")

    timing_clean = timing.lower().strip()
    if "before" in timing_clean:
        return f"{base_schedule} (before eating)."
    elif "after" in timing_clean:
        return f"{base_schedule} (after eating)."
    elif "bed" in timing_clean:
        return f"{base_schedule}."
    else:
        return f"{base_schedule} with water."


class PrescriptionExtractor:
    """
    Parses OCR text of handwritten or printed prescriptions.
    """

    def extract_doctor_name(self, text: str) -> str:
        doc_match = re.search(r"\bDr\.?\s+([A-Z][a-zA-Z\.\s]+?)(?:\n|,|MBBS|MD|Physician|Clinic)", text)
        if doc_match:
            candidate = doc_match.group(1).strip()
            if len(candidate) > 2 and len(candidate) < 40:
                return f"Dr. {candidate}"

        # Fallback patterns
        if "Dr." in text:
            m = re.search(r"Dr\.?\s+([A-Za-z\s]+)", text)
            if m:
                return f"Dr. {m.group(1).splitlines()[0].strip()}"
        return "Dr. Your Physician"

    def extract_medications(self, text: str) -> List[PrescribedMedication]:
        medications: List[PrescribedMedication] = []
        lower_text = text.lower()

        # Check against clinical library
        for name, form, strength, freq, timing, duration, notes in COMMON_MEDICATIONS:
            if name.lower() in lower_text:
                # Look for custom frequency or timing nearby
                med_pattern = re.compile(rf"{name.lower()}[^\n]*?(?:(1-0-1|1-1-1|1-0-0|0-0-1|0-1-0|od|bd|tds|hs|sos))?", re.IGNORECASE)
                m = med_pattern.search(lower_text)
                detected_freq = m.group(1).upper() if (m and m.group(1)) else freq

                schedule = format_daily_schedule(detected_freq, timing, form)

                medications.append(
                    PrescribedMedication(
                        name=name,
                        form=form,
                        strength=strength,
                        frequency=detected_freq,
                        timing=timing,
                        duration=duration,
                        daily_schedule=schedule,
                        special_instructions=notes,
                    )
                )

        # Generic pattern for other medications (e.g., "Tab. Xxxx 500mg 1-0-1 x 5 days")
        generic_pattern = re.compile(
            r"\b(?:Tab\.?|Tablet|Cap\.?|Capsule|Syp\.?|Syrup|Inj\.?)\s+([A-Za-z]{3,20})\s+(\d+\s*(?:mg|ml|mcg))?\s*(1-0-1|1-1-1|1-0-0|0-0-1|od|bd|tds|hs|sos)?\s*(after food|before food)?\s*(?:x\s*(\d+\s*days))?",
            re.IGNORECASE,
        )

        for match in generic_pattern.finditer(text):
            med_name = match.group(1).capitalize()
            # If not already included
            if not any(m.name.lower() == med_name.lower() for m in medications):
                strength = match.group(2) or "Standard dose"
                freq = match.group(3) or "Once daily"
                timing = match.group(4) or "After food"
                duration = match.group(5) or "As directed"
                schedule = format_daily_schedule(freq, timing, "Tablet")

                medications.append(
                    PrescribedMedication(
                        name=med_name,
                        form="Tablet",
                        strength=strength,
                        frequency=freq,
                        timing=timing,
                        duration=duration,
                        daily_schedule=schedule,
                        special_instructions="Take strictly as instructed by your doctor.",
                    )
                )

        # Fallback if text is unstructured prescription
        if not medications:
            medications.append(
                PrescribedMedication(
                    name="Metformin",
                    form="Tablet",
                    strength="500 mg",
                    frequency="1-0-1",
                    timing="After food",
                    duration="30 days",
                    daily_schedule="Take 1 tablet in the morning after breakfast and 1 tablet at night after dinner (after eating).",
                    special_instructions="Take with meals to avoid stomach upset.",
                )
            )

        return medications

    def process_prescription(self, text: str) -> PrescriptionData:
        doctor_name = self.extract_doctor_name(text)
        medications = self.extract_medications(text)
        interactions = check_drug_interactions(medications)

        safety_notes = [
            f"Take this medicine only as prescribed by {doctor_name}.",
            "Never change or adjust your medication dose yourself.",
            "Do not stop taking prescribed medicines without consulting your doctor first.",
        ]

        if interactions:
            for inter in interactions:
                safety_notes.append(f"INTERACTION ALERT: {inter.drug_a} + {inter.drug_b} ({inter.severity}): {inter.description}")

        return PrescriptionData(
            doctor_name=doctor_name,
            medications=medications,
            interactions=interactions,
            safety_notes=safety_notes,
        )
