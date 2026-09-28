"""
Factory for Telephony Providers.
"""

from app.core.config import settings
from app.telephony.base import BaseTelephonyProvider
from app.telephony.providers.mock import MockTelephonyProvider
from app.telephony.providers.exotel import ExotelTelephonyProvider
from app.telephony.providers.twilio import TwilioTelephonyProvider


def get_telephony_provider() -> BaseTelephonyProvider:
    if settings.MOCK_PROVIDERS:
        return MockTelephonyProvider()
    if settings.EXOTEL_API_KEY:
        return ExotelTelephonyProvider()
    if settings.TWILIO_ACCOUNT_SID:
        return TwilioTelephonyProvider()
    return MockTelephonyProvider()
