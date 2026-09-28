"""
Factory for Translation Providers.
"""

from app.core.config import settings
from app.pipeline.translation.base import BaseTranslationProvider
from app.pipeline.translation.mock import MockTranslationProvider
from app.pipeline.translation.bhashini import BhashiniTranslationProvider


def get_translation_provider() -> BaseTranslationProvider:
    if settings.MOCK_PROVIDERS or not settings.BHASHINI_API_KEY:
        return MockTranslationProvider()
    return BhashiniTranslationProvider()
