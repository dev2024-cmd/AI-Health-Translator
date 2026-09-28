"""
Base Text-to-Speech (TTS) Provider Interface.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class TTSResult:
    def __init__(
        self,
        audio_bytes: Optional[bytes],
        language: str,
        available: bool,
        format: str = "mp3",
        error_message: Optional[str] = None
    ):
        self.audio_bytes = audio_bytes
        self.language = language
        self.available = available
        self.format = format
        self.error_message = error_message

    def to_dict(self) -> Dict[str, Any]:
        return {
            "language": self.language,
            "available": self.available,
            "format": self.format,
            "byte_count": len(self.audio_bytes) if self.audio_bytes else 0,
            "error_message": self.error_message,
        }


class BaseTTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, text: str, language: str) -> TTSResult:
        """Synthesizes speech audio for given text in target language."""
        pass
