"""
Base Simplification Interface.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class SimplificationResult:
    def __init__(self, plain_text: str, language: str, provider: str):
        self.plain_text = plain_text
        self.language = language
        self.provider = provider

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plain_text": self.plain_text,
            "language": self.language,
            "provider": self.provider,
        }


class BaseSimplifier(ABC):
    @abstractmethod
    async def simplify_report(
        self,
        extracted_values: List[Any],
        patient_info: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> SimplificationResult:
        """Generates a Grade 5 plain-language explanation of extracted lab results."""
        pass
