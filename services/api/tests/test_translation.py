import pytest
from app.pipeline.translation.terms_protector import ClinicalTermsProtector
from app.pipeline.translation.mock import MockTranslationProvider
from app.pipeline.translation.bhashini import BhashiniTranslationProvider


def test_clinical_terms_protector_preserves_bracketed_terms():
    original = "Your [Hemoglobin] is 11.2 and [Serum Creatinine] is 0.9 mg/dL."
    protected, terms = ClinicalTermsProtector.protect(original)

    assert "__MED_TERM_0__" in protected
    assert "__MED_TERM_1__" in protected
    assert len(terms) == 2
    assert terms[0] == "[Hemoglobin]"
    assert terms[1] == "[Serum Creatinine]"

    # Simulate translation engine modifying surrounding text
    mock_translated = "మీ __MED_TERM_0__ 11.2 మరియు __MED_TERM_1__ 0.9 mg/dL గా ఉంది."
    restored = ClinicalTermsProtector.restore(mock_translated, terms)

    assert "[Hemoglobin]" in restored
    assert "[Serum Creatinine]" in restored
    assert "__MED_TERM_" not in restored


@pytest.mark.asyncio
async def test_mock_translation_across_indian_languages():
    translator = MockTranslationProvider()
    source_text = (
        "Hello, here is a simple explanation of your medical test results in plain words.\n"
        "• [Hemoglobin]: Your reading is 11.2 g/dL, which is lower than normal.\n"
        "Good News (Normal Results):\n"
        "• [Platelet Count]: Your reading is 250000 /mcL, which is in the safe, healthy range."
    )

    # Test Hindi
    res_hi = await translator.translate_explanation(source_text, target_language="hi")
    assert res_hi.target_language == "hi"
    assert "[Hemoglobin]" in res_hi.translated_text
    assert "[Platelet Count]" in res_hi.translated_text
    assert "नमस्ते" in res_hi.translated_text
    assert "महत्वपूर्ण मेडिकल अस्वीकरण" in res_hi.translated_text

    # Test Telugu
    res_te = await translator.translate_explanation(source_text, target_language="te")
    assert res_te.target_language == "te"
    assert "[Hemoglobin]" in res_te.translated_text
    assert "నమస్కారం" in res_te.translated_text
    assert "శుభవార్త" in res_te.translated_text

    # Test Bengali
    res_bn = await translator.translate_explanation(source_text, target_language="bn")
    assert res_bn.target_language == "bn"
    assert "[Hemoglobin]" in res_bn.translated_text
    assert "নমস্কার" in res_bn.translated_text

    # Test Urdu (RTL)
    res_ur = await translator.translate_explanation(source_text, target_language="ur")
    assert res_ur.target_language == "ur"
    assert "[Hemoglobin]" in res_ur.translated_text
    assert "آداب" in res_ur.translated_text


@pytest.mark.asyncio
async def test_bhashini_provider_fallback_to_mock():
    # In mock mode, should seamlessly fallback without error
    provider = BhashiniTranslationProvider()
    res = await provider.translate_explanation(
        "• [Total Cholesterol]: Your reading is 235 mg/dL.",
        target_language="mr"
    )
    assert res is not None
    assert "[Total Cholesterol]" in res.translated_text
