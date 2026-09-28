import pytest
from app.pipeline.tts.mock import MockTTSProvider
from app.pipeline.tts.bhashini import BhashiniTTSProvider


@pytest.mark.asyncio
async def test_tts_available_languages_generate_mp3_bytes():
    tts = MockTTSProvider()

    for lang in ["en", "hi", "te", "ta", "bn", "mr"]:
        result = await tts.synthesize("Your hemoglobin is normal.", language=lang)
        assert result.available is True
        assert result.format == "mp3"
        assert result.audio_bytes is not None
        assert len(result.audio_bytes) > 0
        # Valid MP3 sync word
        assert result.audio_bytes.startswith(b"\xff\xfb")


@pytest.mark.asyncio
async def test_tts_graceful_degradation_for_voiceless_languages():
    tts = MockTTSProvider()

    # Santali (sat), Kashmiri (ks), Sindhi (sd), Dogri (doi), Konkani (kok)
    for voiceless_lang in ["sat", "ks", "sd", "doi", "kok", "mni", "brx"]:
        result = await tts.synthesize("Medical report summary.", language=voiceless_lang)
        assert result.available is False
        assert result.audio_bytes is None
        assert "not yet available" in result.error_message
        assert "fallback" in result.error_message.lower()


@pytest.mark.asyncio
async def test_bhashini_tts_provider_fallback():
    tts = BhashiniTTSProvider()
    result = await tts.synthesize("Your test results are ready.", language="hi")
    assert result.available is True
    assert result.audio_bytes is not None
