"""
Clinical Term Protection Utility.
Preserves original bracketed English terms (e.g. [Hemoglobin]) during translation.
Ensures patients and rural doctors can always identify the exact lab parameter.
"""

import re
from typing import Tuple, List, Dict


class ClinicalTermsProtector:
    """Safeguards [English Clinical Terms] from being mistranslated or dropped by translation engines."""

    BRACKET_REGEX = re.compile(r"\[([a-zA-Z0-9\s\+\-\/\.\(\)]+)\]")

    @classmethod
    def protect(cls, text: str) -> Tuple[str, List[str]]:
        """
        Replaces each [Clinical Term] with a protected token placeholder __MED_TERM_X__.
        Returns (protected_text, original_terms_list).
        """
        terms: List[str] = []

        def replacer(match):
            term = match.group(0)  # full [Term]
            idx = len(terms)
            terms.append(term)
            return f"__MED_TERM_{idx}__"

        protected_text = cls.BRACKET_REGEX.sub(replacer, text)
        return protected_text, terms

    @classmethod
    def restore(cls, translated_text: str, terms: List[str]) -> str:
        """
        Replaces placeholders __MED_TERM_X__ back with the original [Clinical Term].
        Handles possible spacing or capitalization alterations by MT engines.
        """
        restored = translated_text
        for idx, term in enumerate(terms):
            # Matches __MED_TERM_0__, __med_term_0__, __ MED_TERM_0 __, etc.
            pattern = re.compile(rf"__\s*MED_TERM_{idx}\s*__", re.IGNORECASE)
            restored = pattern.sub(f" {term} ", restored)

        # Clean double spaces that might be introduced around tokens
        restored = re.sub(r" +", " ", restored)
        return restored.strip()
