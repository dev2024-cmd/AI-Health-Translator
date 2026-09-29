"""
Prescription Explainer Engine.
Generates safe, 5th-grade plain language schedules with a prominent doctor banner and drug interaction alerts.
Never alters, reduces, or increases any medication dosage.
"""

from typing import Dict
from app.pipeline.prescription.schemas import PrescriptionData
from app.pipeline.safety.guardrail import MANDATORY_DISCLAIMER


BANNER_TEMPLATES: Dict[str, str] = {
    "en": "⚠️ IMPORTANT: Take this medicine only as prescribed by {doctor_name}. Never change your dose or stop taking medication without speaking to your doctor.",
    "te": "⚠️ ముఖ్య గమనిక: ఈ ఔషధాలను {doctor_name} గారు సూచించిన విధంగా మాత్రమే వాడండి. డాక్టరును సంప్రదించకుండా మీ మందుల మోతాదును ఎప్పుడూ మార్చకండి.",
    "hi": "⚠️ महत्वपूर्ण सूचना: इस दवा का सेवन केवल {doctor_name} के निर्देशानुसार ही करें। डॉक्टर से परामर्श किए बिना अपनी खुराक में कोई बदलाव न करें।",
    "ta": "⚠️ முக்கிய குறிப்பு: இந்த மருந்தை {doctor_name} பரிந்துரைத்தபடி மட்டுமே உட்கொள்ளவும். மருத்துவரை அணுகாமல் மருந்து அளவை மாற்ற வேண்டாம்.",
    "bn": "⚠️ গুরুত্বপূর্ণ বিজ্ঞপ্তি: এই ওষুধটি শুধুমাত্র {doctor_name}-এর পরামর্শ অনুযায়ী গ্রহণ করুন। ডাক্তারের সাথে কথা না বলে ওষুধের মাত্রা পরিবর্তন করবেন না।",
}

SCHEDULE_HEADER: Dict[str, str] = {
    "en": "📋 Your Daily Medication Routine:",
    "te": "📋 మీ రోజువారీ మందుల సమయ పట్టిక:",
    "hi": "📋 आपकी दैनिक दवा की समय सारणी:",
    "ta": "📋 உங்கள் தினசரி மருந்து அட்டவணை:",
    "bn": "📋 আপনার দৈনিক ওষুধের সময়সূচী:",
}

INTERACTION_HEADER: Dict[str, str] = {
    "en": "🚨 Clinical Safety & Drug Interaction Alert:",
    "te": "🚨 ఔషధ కలయిక భద్రతా హెచ్చరిక (Drug Interaction):",
    "hi": "🚨 दवा पारस्परिक क्रिया चेतावनी (Drug Interaction):",
    "ta": "🚨 மருந்து கலவை எச்சரிக்கை:",
    "bn": "🚨 ওষুধের মিথস্ক্রিয়া সংক্রান্ত সতর্কতা:",
}


def generate_prescription_explanation(
    data: PrescriptionData,
    patient_name: str = "Patient",
    language: str = "en"
) -> str:
    """
    Builds a plain-language explanation for a prescription with:
    1. Prominent Doctor Banner
    2. Clear Daily Routine (morning, noon, night)
    3. Food instructions (before/after meals)
    4. Drug interactions & precautions
    5. Mandatory Clinical Safety Disclaimer
    """
    lang = language if language in BANNER_TEMPLATES else "en"
    banner = BANNER_TEMPLATES[lang].format(doctor_name=data.doctor_name)
    sched_hdr = SCHEDULE_HEADER[lang]

    med_lines = []
    for idx, med in enumerate(data.medications, 1):
        line = f"{idx}. {med.name} ({med.form}, {med.strength or 'as prescribed'}):"
        if med.what_it_is:
            line += f"\n   • 💊 What the tablet is: {med.what_it_is}"
        if med.what_it_is_for:
            line += f"\n   • 🎯 What it is for: {med.what_it_is_for}"
        if med.what_it_will_do:
            line += f"\n   • ⚡ What will it do: {med.what_it_will_do}"
        line += f"\n   • ⏰ How & when to take: {med.daily_schedule}"
        if med.duration:
            line += f" ({med.duration})"
        if med.special_instructions:
            line += f"\n   • Instruction: {med.special_instructions}"
        med_lines.append(line)

    medications_section = "\n\n".join(med_lines)

    interaction_section = ""
    if data.interactions:
        inter_hdr = INTERACTION_HEADER[lang]
        inter_lines = [inter_hdr]
        for inter in data.interactions:
            inter_lines.append(
                f"• [{inter.severity}] {inter.drug_a} + {inter.drug_b}:\n"
                f"  {inter.description}\n"
                f"  Advice: {inter.clinical_advice}"
            )
        interaction_section = "\n\n" + "\n\n".join(inter_lines)

    full_text = (
        f"{banner}\n\n"
        f"{sched_hdr}\n\n"
        f"{medications_section}"
        f"{interaction_section}\n\n"
        f"{MANDATORY_DISCLAIMER}"
    )

    return full_text
