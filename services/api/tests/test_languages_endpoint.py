import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_languages_matrix(client: AsyncClient):
    res = await client.get("/v1/languages")
    assert res.status_code == 200
    languages = res.json()

    # 22 scheduled Indian languages + English = 23 total
    assert len(languages) == 23

    # Check that codes exist
    codes = [l["code"] for l in languages]
    expected_major = ["en", "hi", "bn", "te", "mr", "ta", "gu", "ur", "kn", "or", "ml", "pa", "as", "sa"]
    for code in expected_major:
        assert code in codes

    # Check RTL languages
    rtl_langs = [l for l in languages if l["direction"] == "rtl"]
    rtl_codes = [l["code"] for l in rtl_langs]
    assert "ur" in rtl_codes
    assert "ks" in rtl_codes
    assert "sd" in rtl_codes

    # Check high-resource vs voiceless TTS flags
    hi_lang = next(l for l in languages if l["code"] == "hi")
    assert hi_lang["tts_available"] is True

    sat_lang = next(l for l in languages if l["code"] == "sat")
    assert sat_lang["tts_available"] is False
    assert sat_lang["fallback_language"] == "hi"
