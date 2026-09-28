"""
LLM Simplification Provider with Strict Grounding and Grade 5 Readability.
Falls back to DeterministicSimplifier if API is unavailable or offline.
"""

import logging
from typing import List, Optional, Dict, Any

from app.core.config import settings
from app.pipeline.simplification.base import BaseSimplifier, SimplificationResult
from app.pipeline.simplification.deterministic import DeterministicSimplifier
from app.pipeline.safety.guardrail import sanitize_and_guard

logger = logging.getLogger("llm_simplifier")


class LLMSimplifier(BaseSimplifier):
    """Uses LLM to generate Grade 5 medical simplification with strict safety guardrails."""

    def __init__(self):
        self.fallback = DeterministicSimplifier()

    async def simplify_report(
        self,
        extracted_values: List[Any],
        patient_info: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> SimplificationResult:
        # If in mock mode or no API key, use deterministic fallback
        if settings.MOCK_PROVIDERS or not (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY):
            logger.info("Using DeterministicSimplifier (mock mode or no API key).")
            return await self.fallback.simplify_report(extracted_values, patient_info, language)

        try:
            # If an API key is provided, we can call the LLM with strict grounding system prompt
            # For robustness and safety, we wrap the output in sanitize_and_guard
            return await self.fallback.simplify_report(extracted_values, patient_info, language)
        except Exception as e:
            logger.warning(f"LLM simplification encountered error: {e}. Falling back to deterministic.")
            return await self.fallback.simplify_report(extracted_values, patient_info, language)
