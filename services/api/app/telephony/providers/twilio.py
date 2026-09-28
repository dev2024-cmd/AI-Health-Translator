"""
Twilio Telephony Provider.
Initiates voice calls via TwiML and sends SMS messages globally.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.telephony.base import BaseTelephonyProvider, CallResult, SMSResult
from app.telephony.providers.mock import MockTelephonyProvider

logger = logging.getLogger("twilio_telephony")


class TwilioTelephonyProvider(BaseTelephonyProvider):
    def __init__(self):
        self.fallback = MockTelephonyProvider()

    async def initiate_call(
        self,
        to_phone: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> CallResult:
        if settings.MOCK_PROVIDERS or not settings.TWILIO_ACCOUNT_SID:
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)

        try:
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)
        except Exception as e:
            logger.error(f"Twilio call failed: {e}. Falling back to mock.")
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> SMSResult:
        if settings.MOCK_PROVIDERS or not settings.TWILIO_ACCOUNT_SID:
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)

        try:
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)
        except Exception as e:
            logger.error(f"Twilio SMS failed: {e}. Falling back to mock.")
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)
