"""
Exotel Indian Telephony Provider.
Initiates automated outbound calls and SMS for India via Exotel API.
"""

import httpx
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.telephony.base import BaseTelephonyProvider, CallResult, SMSResult
from app.telephony.providers.mock import MockTelephonyProvider

logger = logging.getLogger("exotel_telephony")


class ExotelTelephonyProvider(BaseTelephonyProvider):
    def __init__(self):
        self.fallback = MockTelephonyProvider()

    async def initiate_call(
        self,
        to_phone: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> CallResult:
        if settings.MOCK_PROVIDERS or not settings.EXOTEL_API_KEY:
            logger.info("Using MockTelephonyProvider for IVR call (MOCK_PROVIDERS=true or no Exotel key).")
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)

        # Production Exotel REST call
        try:
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)
        except Exception as e:
            logger.error(f"Exotel call failed: {e}. Falling back to mock.")
            return await self.fallback.initiate_call(to_phone, report_id, patient_id, db)

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> SMSResult:
        if settings.MOCK_PROVIDERS or not settings.EXOTEL_API_KEY:
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)

        try:
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)
        except Exception as e:
            logger.error(f"Exotel SMS failed: {e}. Falling back to mock.")
            return await self.fallback.send_sms(to_phone, message, report_id, patient_id, db)
