"""
Base Telephony Provider Interface (Voice IVR & SMS).
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession


class CallResult:
    def __init__(
        self,
        call_id: str,
        status: str,
        provider_sid: str,
        greeting_prompt: str,
        channel: str = "ivr"
    ):
        self.call_id = call_id
        self.status = status
        self.provider_sid = provider_sid
        self.greeting_prompt = greeting_prompt
        self.channel = channel

    def to_dict(self) -> Dict[str, Any]:
        return {
            "call_id": self.call_id,
            "status": self.status,
            "provider_sid": self.provider_sid,
            "greeting_prompt": self.greeting_prompt,
            "channel": self.channel,
        }


class SMSResult:
    def __init__(
        self,
        sms_id: str,
        status: str,
        provider_sid: str,
        body: str,
        channel: str = "sms"
    ):
        self.sms_id = sms_id
        self.status = status
        self.provider_sid = provider_sid
        self.body = body
        self.channel = channel

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sms_id": self.sms_id,
            "status": self.status,
            "provider_sid": self.provider_sid,
            "body": self.body,
            "channel": self.channel,
        }


class BaseTelephonyProvider(ABC):
    @abstractmethod
    async def initiate_call(
        self,
        to_phone: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> CallResult:
        """Initiates an automated IVR phone call to patient."""
        pass

    @abstractmethod
    async def send_sms(
        self,
        to_phone: str,
        message: str,
        report_id: str,
        patient_id: str,
        db: AsyncSession
    ) -> SMSResult:
        """Sends an SMS message to patient."""
        pass
