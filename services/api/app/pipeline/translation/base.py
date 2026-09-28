"""
Base Translation Provider Interface.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class TranslationResult:
    def __init__(
        self,
        translated_text: str,
        source_language: str,
        target_language: str,
        provider: str,
        is_fallback: bool = False
    ):
        self.translated_text = translated_text
        self.source_language = source_language
        self.target_language = target_language
        self.provider = provider
        self.is_fallback = is_fallback

    def to_dict(self) -> Dict[str, Any]:
        return {
            "translated_text": self.translated_text,
            "source_language": self.source_language,
            "target_language": self.target_language,
            "provider": self.provider,
            "is_fallback": self.is_fallback,
        }


class BaseTranslationProvider(ABC):
    @abstractmethod
    async def translate_explanation(
        self,
        text: str,
        target_language: str,
        source_language: str = "en"
    ) -> TranslationResult:
        """Translates plain-language medical explanation into target Indian language."""
        pass
