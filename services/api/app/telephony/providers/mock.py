"""
Deterministic Mock Telephony Provider.
Simulates IVR voice calls and SMS delivery for feature phones, recording to call_logs.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.call_log import CallLog
from app.models.patient import Patient
from app.telephony.base import BaseTelephonyProvider, CallResult, SMSResult
from app.telephony.ivr_flow import get_ivr_menu


class MockTelephonyProvider(BaseTelephonyProvider):
    """Simulates voice calls and SMS without requiring paid telecom credentials."""

    async def initiate_call(
        self,
        to_phone: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> CallResult:
        # Fetch patient preferred language
        patient_res = await db.execute(select(Patient).where(Patient.id == patient_id))
        patient = patient_res.scalar_one_or_none()
        patient_name = patient.display_name if patient else "Patient"
        patient_lang = patient.preferred_language if patient else "en"

        greeting = get_ivr_menu(language=patient_lang, patient_name=patient_name)

        call_log = CallLog(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            report_id=report_id,
            channel="ivr",
            provider_sid=f"mock_call_{uuid.uuid4().hex[:12]}",
            status="in-progress",
            keypad_events=[{"event": "CALL_INITIATED", "phone": to_phone}],
        )
        db.add(call_log)
        await db.commit()
        await db.refresh(call_log)

        return CallResult(
            call_id=call_log.id,
            status="in-progress",
            provider_sid=call_log.provider_sid,
            greeting_prompt=greeting,
            channel="ivr"
        )

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> SMSResult:
        sms_log = CallLog(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            report_id=report_id,
            channel="sms",
            provider_sid=f"mock_sms_{uuid.uuid4().hex[:12]}",
            status="delivered",
            keypad_events=[{"event": "SMS_SENT", "body": message, "to": to_phone}],
        )
        db.add(sms_log)
        await db.commit()
        await db.refresh(sms_log)

        return SMSResult(
            sms_id=sms_log.id,
            status="delivered",
            provider_sid=sms_log.provider_sid,
            body=message,
            channel="sms"
        )
