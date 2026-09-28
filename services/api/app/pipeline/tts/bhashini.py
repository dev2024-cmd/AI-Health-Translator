"""
Bhashini TTS Provider for Indian Languages.
Connects to ULCA Bhashini voice synthesis service with fallback.
"""

import httpx
import base64
import logging
from typing import Optional

from app.core.config import settings
from app.core.languages import get_language_config
from app.pipeline.tts.base import BaseTTSProvider, TTSResult
from app.pipeline.tts.mock import MockTTSProvider

logger = logging.getLogger("bhashini_tts")


class BhashiniTTSProvider(BaseTTSProvider):
    """Integrates with Government of India Bhashini TTS pipeline."""

    def __init__(self):
        self.fallback = MockTTSProvider()

    async def synthesize(self, text: str, language: str) -> TTSResult:
        lang_config = get_language_config(language)

        # Check if language has TTS capability
        if not lang_config.get("tts_available", False):
            return await self.fallback.synthesize(text, language)

        if settings.MOCK_PROVIDERS or not settings.BHASHINI_API_KEY:
            logger.info(f"Using MockTTSProvider for {language} (MOCK_PROVIDERS=true or no key).")
            return await self.fallback.synthesize(text, language)

        try:
            url = f"{settings.BHASHINI_API_URL}/services/inference/pipeline"
            headers = {
                "Authorization": settings.BHASHINI_API_KEY,
                "Content-Type": "application/json",
            }
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "tts",
                        "config": {
                            "language": {"sourceLanguage": language},
                            "gender": "female"
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": text[:500]}]  # Bhashini input limit
                }
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    audio_b64 = (
                        data.get("pipelineResponse", [{}])[0]
                        .get("audio", [{}])[0]
                        .get("audioContent", "")
                    )
                    if audio_b64:
                        audio_bytes = base64.b64decode(audio_b64)
                        return TTSResult(
                            audio_bytes=audio_bytes,
                            language=language,
                            available=True,
                            format="mp3"
                        )

            logger.warning("Bhashini TTS returned unexpected structure. Falling back to mock.")
            return await self.fallback.synthesize(text, language)

        except Exception as e:
            logger.warning(f"Bhashini TTS request error: {e}. Falling back to mock.")
            return await self.fallback.synthesize(text, language)
