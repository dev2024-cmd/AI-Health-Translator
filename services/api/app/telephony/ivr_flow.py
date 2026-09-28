"""
IVR (Interactive Voice Response) State Machine and Prompt Engine.
Designed specifically for rural and elderly Indian users on basic feature phones (Nokia, JioPhone, etc.).
"""

from typing import Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.report import Report
from app.models.patient import Patient
from app.models.explanation import Explanation
from app.models.call_log import CallLog
from app.models.escalation import Escalation
from app.pipeline.escalation.manager import handle_report_escalations
import uuid

# Multilingual IVR Voice Prompts
IVR_PROMPTS: Dict[str, Dict[str, str]] = {
    "te": {
        "greeting": "నమస్కారం {name} గారు. మీ మెడికల్ రిపోర్ట్ సిద్ధంగా ఉంది. నివేదిక వివరణ వినడానికి 1 నొక్కండి. నిదానంగా వినడానికి 2 నొక్కండి. మీ ఆశా కార్యకర్తతో మాట్లాడటానికి 3 నొక్కండి. భాష మార్చడానికి 0 నొక్కండి.",
        "callback_confirmed": "మీ ఆశా కార్యకర్తకు సమాచారం అందించబడింది. వారు త్వరలోనే మీకు ఫోన్ చేసి మాట్లాడతారు. ఆరోగ్యంగా ఉండండి.",
        "invalid_key": "సరైన బటన్ నొక్కండి. వినడానికి 1, నెమ్మదిగా వినడానికి 2, ఆరోగ్య కార్యకర్త కోసం 3 నొక్కండి.",
        "goodbye": "ధన్యవాదాలు. మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి. కాల్ ముగుస్తుంది.",
    },
    "hi": {
        "greeting": "नमस्ते {name} जी। आपकी मेडिकल टेस्ट रिपोर्ट तैयार है। रिपोर्ट का विवरण सुनने के लिए 1 दबाएं। धीरे-धीरे सुनने के लिए 2 दबाएं। अपनी आशा दीदी से बात करने के लिए 3 दबाएं। भाषा बदलने के लिए 0 दबाएं।",
        "callback_confirmed": "आपकी आशा कार्यकर्ता को सूचित कर दिया गया है। वे जल्द ही आपसे फोन पर संपर्क करेंगी। धन्यवाद।",
        "invalid_key": "अमान्य बटन। सुनने के लिए 1 दबाएं, धीरे सुनने के लिए 2 दबाएं, आशा दीदी से बात करने के लिए 3 दबाएं।",
        "goodbye": "कॉल करने के लिए धन्यवाद। अपना ख्याल रखें।",
    },
    "en": {
        "greeting": "Hello {name}. Your medical test report is ready. Press 1 to hear your report explanation. Press 2 to listen slowly. Press 3 to request a callback from your community health worker. Press 0 to switch language.",
        "callback_confirmed": "Your primary health worker has been notified and will call your phone shortly. Stay healthy.",
        "invalid_key": "Invalid option. Press 1 to listen, 2 to listen slowly, or 3 to speak with a health worker.",
        "goodbye": "Thank you for calling AI Health Translator. Goodbye.",
    }
}


def get_ivr_menu(language: str = "en", patient_name: str = "Patient") -> str:
    lang = language.lower()
    prompts = IVR_PROMPTS.get(lang, IVR_PROMPTS["en"])
    return prompts["greeting"].format(name=patient_name)


async def process_dtmf_digit(
    call_log: CallLog,
    digit: str,
    db: AsyncSession
) -> Tuple[str, bool, str]:
    """
    Handles user keypad input during an IVR voice call.
    Returns: (spoken_response, should_hang_up, next_action)
    """
    digit = str(digit).strip()

    # Fetch patient & report details
    patient_res = await db.execute(select(Patient).where(Patient.id == call_log.patient_id))
    patient = patient_res.scalar_one_or_none()
    patient_name = patient.display_name if patient else "Patient"
    patient_lang = patient.preferred_language if patient else "en"

    # Fetch explanation
    exp_res = await db.execute(
        select(Explanation).where(
            Explanation.report_id == call_log.report_id,
            Explanation.language == patient_lang
        )
    )
    explanation = exp_res.scalar_one_or_none()
    explanation_text = explanation.text if explanation else "Your test report has been reviewed."

    prompts = IVR_PROMPTS.get(patient_lang, IVR_PROMPTS["en"])

    # Update keypad events history in call log
    events = list(call_log.keypad_events or [])
    events.append({"digit": digit, "action": ""})

    if digit == "1":
        # Press 1: Listen to standard explanation
        events[-1]["action"] = "LISTEN_NORMAL"
        call_log.keypad_events = events
        await db.commit()
        response_text = f"{explanation_text}\n\n{prompts['goodbye']}"
        return response_text, False, "REPEAT_OR_EXIT"

    elif digit == "2":
        # Press 2: Listen slowly with extra guidance
        events[-1]["action"] = "LISTEN_SLOW"
        call_log.keypad_events = events
        await db.commit()
        # Slow pacing preface
        slow_preface = "Speaking slowly: " if patient_lang == "en" else "धीरे-धीरे विवरण: "
        response_text = f"{slow_preface}\n{explanation_text}\n\n{prompts['goodbye']}"
        return response_text, False, "REPEAT_OR_EXIT"

    elif digit == "3":
        # Press 3: Request call from Health Worker
        events[-1]["action"] = "REQUEST_HEALTH_WORKER_CALLBACK"
        call_log.keypad_events = events

        # Create Escalation Ticket
        escalation = Escalation(
            id=str(uuid.uuid4()),
            report_id=call_log.report_id,
            patient_id=call_log.patient_id,
            reason=f"Patient {patient_name} requested consultation callback via feature phone IVR (Key 3 pressed).",
            status="open",
            assigned_to=None,
            notes="Initiated via automated phone IVR line.",
        )
        db.add(escalation)
        await db.commit()

        return prompts["callback_confirmed"], True, "HANG_UP"

    elif digit == "0":
        # Press 0: Toggle Language between Telugu, Hindi, English
        new_lang = "hi" if patient_lang == "te" else ("en" if patient_lang == "hi" else "te")
        if patient:
            patient.preferred_language = new_lang
            db.add(patient)

        events[-1]["action"] = f"SWITCH_LANGUAGE_TO_{new_lang.upper()}"
        call_log.keypad_events = events
        await db.commit()

        new_prompts = IVR_PROMPTS.get(new_lang, IVR_PROMPTS["en"])
        new_greeting = new_prompts["greeting"].format(name=patient_name)
        return new_greeting, False, "WAIT_FOR_INPUT"

    else:
        # Invalid input
        events[-1]["action"] = "INVALID_KEY"
        call_log.keypad_events = events
        await db.commit()
        return prompts["invalid_key"], False, "WAIT_FOR_INPUT"
