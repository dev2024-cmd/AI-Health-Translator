"""
Factory for Simplification Providers.
"""

from app.core.config import settings
from app.pipeline.simplification.base import BaseSimplifier
from app.pipeline.simplification.deterministic import DeterministicSimplifier
from app.pipeline.simplification.llm import LLMSimplifier


def get_simplifier() -> BaseSimplifier:
    if settings.MOCK_PROVIDERS:
        return DeterministicSimplifier()
    return LLMSimplifier()
