"""
Factory for TTS Providers.
"""

from app.core.config import settings
from app.pipeline.tts.base import BaseTTSProvider
from app.pipeline.tts.mock import MockTTSProvider
from app.pipeline.tts.bhashini import BhashiniTTSProvider


def get_tts_provider() -> BaseTTSProvider:
    if settings.MOCK_PROVIDERS or not settings.BHASHINI_API_KEY:
        return MockTTSProvider()
    return BhashiniTTSProvider()
