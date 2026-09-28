"""
Deterministic Grade-5 Simplification Provider.
Generates calm, structured plain-language medical explanations using matched glossary analogies.
Ensures 100% repeatable, safe explanations with original English terms bracketed.
"""

from typing import List, Optional, Dict, Any

from app.pipeline.simplification.base import BaseSimplifier, SimplificationResult
from app.pipeline.glossary.matcher import match_glossary_term
from app.pipeline.safety.guardrail import sanitize_and_guard


class DeterministicSimplifier(BaseSimplifier):
    """Rule-based, template-driven Grade 5 explainer with zero hallucinations."""

    async def simplify_report(
        self,
        extracted_values: List[Any],
        patient_info: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> SimplificationResult:
        if not extracted_values:
            empty_msg = sanitize_and_guard("No laboratory test measurements were found in this document.")
            return SimplificationResult(empty_msg, language, "deterministic")

        lines = []

        patient_name = patient_info.get("name") if patient_info else None
        if patient_name:
            lines.append(f"Hello, here is a simple explanation of {patient_name}'s medical test results.")
        else:
            lines.append("Hello, here is a simple explanation of your medical test results in plain words.")

        # Group values by severity
        critical_vals = [v for v in extracted_values if getattr(v, "flag", "normal") == "critical"]
        high_vals = [v for v in extracted_values if getattr(v, "flag", "normal") == "high"]
        low_vals = [v for v in extracted_values if getattr(v, "flag", "normal") == "low"]
        normal_vals = [v for v in extracted_values if getattr(v, "flag", "normal") == "normal"]

        # Urgent notification if any critical values exist
        if critical_vals:
            lines.append("\n⚠️ IMPORTANT NOTICE:")
            for v in critical_vals:
                glossary = await match_glossary_term(v.test_name)
                analogy = f" ({glossary.definition_simple})" if glossary else ""
                lines.append(
                    f"• [{v.test_name}]: Your reading is {v.value} {v.unit}. "
                    f"This is significantly outside the safe reference range.{analogy} "
                    f"We strongly recommend having a doctor or community health worker review this today."
                )

        # Normal results (reassurance first!)
        if normal_vals:
            lines.append("\nGood News (Normal Results):")
            for v in normal_vals:
                glossary = await match_glossary_term(v.test_name)
                analogy = f" {glossary.definition_simple}" if glossary else ""
                lines.append(
                    f"• [{v.test_name}]: Your reading is {v.value} {v.unit}, which is in the safe, healthy range.{analogy}"
                )

        # Values that are lower than expected
        if low_vals:
            lines.append("\nResults to Discuss with Your Doctor (Lower than Usual):")
            for v in low_vals:
                glossary = await match_glossary_term(v.test_name)
                analogy = f" {glossary.definition_simple}" if glossary else ""
                ref_text = ""
                if v.ref_low is not None and v.ref_high is not None:
                    ref_text = f" (standard range is {v.ref_low} - {v.ref_high} {v.unit})"
                elif v.ref_low is not None:
                    ref_text = f" (standard minimum is {v.ref_low} {v.unit})"

                lines.append(
                    f"• [{v.test_name}]: Your reading is {v.value} {v.unit}{ref_text}, which is lower than normal.{analogy} "
                    f"Having less of this can sometimes make you feel tired or run down."
                )

        # Values that are higher than expected
        if high_vals:
            lines.append("\nResults to Discuss with Your Doctor (Higher than Usual):")
            for v in high_vals:
                glossary = await match_glossary_term(v.test_name)
                analogy = f" {glossary.definition_simple}" if glossary else ""
                ref_text = ""
                if v.ref_low is not None and v.ref_high is not None:
                    ref_text = f" (standard range is {v.ref_low} - {v.ref_high} {v.unit})"
                elif v.ref_high is not None:
                    ref_text = f" (standard maximum is {v.ref_high} {v.unit})"

                lines.append(
                    f"• [{v.test_name}]: Your reading is {v.value} {v.unit}{ref_text}, which is higher than normal.{analogy} "
                    f"Your doctor can suggest helpful dietary or lifestyle adjustments."
                )

        # Concluding guidance
        lines.append(
            "\nNext Steps: Show these results to your doctor or community health worker. "
            "They will consider your overall physical health, age, and any symptoms before deciding if any action is needed."
        )

        full_raw_text = "\n".join(lines)
        guarded_text = sanitize_and_guard(full_raw_text)

        return SimplificationResult(
            plain_text=guarded_text,
            language=language,
            provider="deterministic"
        )
