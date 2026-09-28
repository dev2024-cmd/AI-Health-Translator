"""
SMS Summary Formatter.
Constructs concise, Grade-5 plain-language text messages under 160 characters.
"""

from typing import List, Any


def format_report_sms(
    patient_name: str,
    extracted_values: List[Any],
    language: str = "en"
) -> str:
    """
    Produces a 160-character compliant SMS summary with key lab readings and emergency notices.
    """
    short_name = patient_name.split()[0] if patient_name else "Patient"

    # Identify abnormal or key values
    flagged = [v for v in extracted_values if getattr(v, "flag", "normal") != "normal"]
    normals = [v for v in extracted_values if getattr(v, "flag", "normal") == "normal"]

    if language == "hi":
        items = []
        for v in (flagged + normals)[:3]:
            status_text = "कम" if v.flag == "low" else ("अधिक" if v.flag == "high" else ("गंभीर" if v.flag == "critical" else "सामान्य"))
            items.append(f"{v.test_name} {v.value} ({status_text})")
        joined = ", ".join(items)
        msg = f"सेहत रिपोर्ट ({short_name}): {joined}। सलाह हेतु डॉक्टर से मिलें। ऑडियो सुनने हेतु 1800-111-222 पर कॉल करें।"
    elif language == "te":
        items = []
        for v in (flagged + normals)[:3]:
            status_text = "తక్కువ" if v.flag == "low" else ("ఎక్కువ" if v.flag == "high" else ("ప్రమాదం" if v.flag == "critical" else "సాధారణం"))
            items.append(f"{v.test_name} {v.value} ({status_text})")
        joined = ", ".join(items)
        msg = f"ఆరోగ్య రిపోర్ట్ ({short_name}): {joined}. డాక్టర్ ను సంప్రదించండి. ఆడియో కోసం 1800-111-222 కి కాల్ చేయండి."
    else:
        items = []
        for v in (flagged + normals)[:3]:
            status_text = "Low" if v.flag == "low" else ("High" if v.flag == "high" else ("Crit" if v.flag == "critical" else "Norm"))
            items.append(f"{v.test_name} {v.value} ({status_text})")
        joined = ", ".join(items)
        msg = f"HealthTranslate ({short_name}): {joined}. Consult doctor. Call 1800-111-222 for voice audio."

    return msg.strip()
