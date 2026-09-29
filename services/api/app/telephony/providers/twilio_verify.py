"""Twilio Verify adapter used for authentication OTPs."""

import httpx

from app.core.config import settings


class OTPProviderError(Exception):
    """A provider error that is safe to expose as a generic API failure."""


class TwilioVerifyProvider:
    """Send and check SMS OTPs with Twilio Verify.

    Twilio stores the one-time code, so production codes are never kept in the
    application's in-memory development OTP store.
    """

    base_url = "https://verify.twilio.com/v2"

    def _validate_configuration(self) -> None:
        if not all(
            (
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN,
                settings.TWILIO_VERIFY_SERVICE_SID,
            )
        ):
            raise OTPProviderError("Twilio Verify is not configured")

    @property
    def _service_url(self) -> str:
        return f"{self.base_url}/Services/{settings.TWILIO_VERIFY_SERVICE_SID}"

    @property
    def _auth(self) -> tuple[str, str]:
        return (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    async def send_code(self, phone: str) -> None:
        self._validate_configuration()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self._service_url}/Verifications",
                    data={"To": phone, "Channel": "sms"},
                    auth=self._auth,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise OTPProviderError("Twilio could not send the verification code") from exc

    async def check_code(self, phone: str, code: str) -> bool:
        self._validate_configuration()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self._service_url}/VerificationCheck",
                    data={"To": phone, "Code": code},
                    auth=self._auth,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            # Invalid and expired codes are rejected by Twilio with a 4xx status.
            if exc.response.status_code in (400, 404):
                return False
            raise OTPProviderError("Twilio could not verify the code") from exc
        except httpx.HTTPError as exc:
            raise OTPProviderError("Twilio could not verify the code") from exc

        return response.json().get("status") == "approved"
