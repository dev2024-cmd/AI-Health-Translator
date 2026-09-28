"""
Bhashini / ULCA Machine Translation Provider (IndicTrans2).
Connects to Digital India Bhashini APIs with automatic term protection.
"""

import httpx
import logging
from typing import Dict, Any

from app.core.config import settings
from app.pipeline.translation.base import BaseTranslationProvider, TranslationResult
from app.pipeline.translation.mock import MockTranslationProvider
from app.pipeline.translation.terms_protector import ClinicalTermsProtector
from app.pipeline.safety.guardrail import sanitize_and_guard

logger = logging.getLogger("bhashini_translator")


class BhashiniTranslationProvider(BaseTranslationProvider):
    """Integrates with Government of India Bhashini (ULCA) IndicTrans2 models."""

    def __init__(self):
        self.fallback = MockTranslationProvider()

    async def translate_explanation(
        self,
        text: str,
        target_language: str,
        source_language: str = "en"
    ) -> TranslationResult:
        if settings.MOCK_PROVIDERS or not settings.BHASHINI_API_KEY:
            logger.info("Using MockTranslationProvider (MOCK_PROVIDERS=true or no Bhashini key).")
            return await self.fallback.translate_explanation(text, target_language, source_language)

        try:
            # Step 1: Protect bracketed clinical terms [Hemoglobin]
            protected_text, terms = ClinicalTermsProtector.protect(text)

            # Step 2: Call Bhashini API endpoint
            url = f"{settings.BHASHINI_API_URL}/services/inference/pipeline"
            headers = {
                "Authorization": settings.BHASHINI_API_KEY,
                "Content-Type": "application/json",
            }
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": source_language,
                                "targetLanguage": target_language,
                            }
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": protected_text}]
                }
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    translated_output = (
                        data.get("pipelineResponse", [{}])[0]
                        .get("output", [{}])[0]
                        .get("target", "")
                    )
                    if translated_output:
                        # Step 3: Restore bracketed terms
                        restored = ClinicalTermsProtector.restore(translated_output, terms)
                        guarded = sanitize_and_guard(restored)
                        return TranslationResult(
                            translated_text=guarded,
                            source_language=source_language,
                            target_language=target_language,
                            provider="bhashini"
                        )

            logger.warning("Bhashini returned unexpected response. Falling back to mock translation.")
            return await self.fallback.translate_explanation(text, target_language, source_language)

        except Exception as e:
            logger.warning(f"Bhashini translation failed: {e}. Falling back to mock provider.")
            return await self.fallback.translate_explanation(text, target_language, source_language)
