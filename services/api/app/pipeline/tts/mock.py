"""
Deterministic Mock TTS Provider.
Synthesizes speech audio frames with graceful degradation for voiceless Indian languages.
"""

from typing import Optional

from app.core.languages import get_language_config
from app.pipeline.tts.base import BaseTTSProvider, TTSResult


def _generate_valid_mp3_frames() -> bytes:
    """Creates a minimal valid MP3 stream (MPEG-1 Layer 3, 128kbps, 44.1kHz)."""
    # Standard MP3 frame header (0xFF, 0xFB, 0x90, 0x00) + 417 bytes padding per frame
    frame = b"\xff\xfb\x90\x00" + (b"\x00" * 414)
    # 4 frames for a lightweight audio stream
    return frame * 4


class MockTTSProvider(BaseTTSProvider):
    """Generates audio for TTS-enabled languages and degrades gracefully for voiceless languages."""

    async def synthesize(self, text: str, language: str) -> TTSResult:
        lang_config = get_language_config(language)

        # Check if TTS is supported for this language
        if not lang_config.get("tts_available", False):
            fallback = lang_config.get("fallback_language", "en")
            return TTSResult(
                audio_bytes=None,
                language=language,
                available=False,
                error_message=f"Direct voice synthesis is not yet available for {lang_config['name']} ({language}). Recommended audio fallback: {fallback.upper()}."
            )

        # Generate lightweight audio bytes
        audio_data = _generate_valid_mp3_frames()
        return TTSResult(
            audio_bytes=audio_data,
            language=language,
            available=True,
            format="mp3"
        )
