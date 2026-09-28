import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.report import Report
from app.models.report_file import ReportFile
from app.models.patient import Patient
from app.models.extracted_value import ExtractedValue
from app.models.explanation import Explanation
from app.storage import get_storage_service
from app.pipeline.ocr.factory import get_ocr_provider
from app.pipeline.extraction.factory import get_extraction_provider
from app.pipeline.flagging.evaluator import evaluate_flag
from app.pipeline.simplification.factory import get_simplifier
from app.pipeline.escalation.manager import handle_report_escalations

logger = logging.getLogger("pipeline")


async def run_report_pipeline(report_id: str, db: AsyncSession) -> Report:
    """
    Executes the report processing pipeline.
    Stage 1: OCR (Ingests uploaded file -> Extracts text).
    Stage 2: Extraction (Extracts structured lab test rows).
    Stage 3: Deterministic Flagging (Evaluates normal/low/high/critical flags).
    Stage 4: Simplification (Grade 5 plain-language explanation with glossary analogies).
    Stage 5: Escalation (Auto-escalates critical values to health workers).
    """
    res = await db.execute(
        select(Report)
        .options(
            selectinload(Report.files),
            selectinload(Report.extracted_values),
            selectinload(Report.explanations)
        )
        .where(Report.id == report_id)
    )
    report = res.scalar_one_or_none()
    if not report:
        logger.error(f"Report {report_id} not found.")
        return None

    try:
        storage = get_storage_service()
        ocr_provider = get_ocr_provider()
        extraction_provider = get_extraction_provider()
        simplifier = get_simplifier()

        # Fetch patient metadata for personalized simplification & preferred language
        patient_res = await db.execute(select(Patient).where(Patient.id == report.patient_id))
        patient = patient_res.scalar_one_or_none()
        patient_info = {
            "name": patient.display_name if patient else "Patient",
            "age": None,
            "gender": None,
        }
        preferred_lang = patient.preferred_language if (patient and patient.preferred_language) else "en"

        # Ensure files exist
        if not report.files:
            report.status = "failed"
            await db.commit()
            return report

        # ---------------- Stage 1: Multi-Page OCR ----------------
        report.status = "ocr"
        await db.commit()

        # Sort files by page_order so multi-page documents are read in sequence
        sorted_files = sorted(
            report.files,
            key=lambda f: getattr(f, "page_order", 1) or 1
        )

        from app.pipeline.base import OCRPage, OCRResult
        from app.pipeline.ocr.detector import detect_document_type
        from app.pipeline.prescription import (
            PrescriptionExtractor,
            generate_prescription_explanation,
        )

        all_pages: list[OCRPage] = []
        full_text_parts: list[str] = []
        global_page_num = 1

        for report_file in sorted_files:
            file_bytes = await storage.download_file(report_file.storage_key)
            file_ocr_result = await ocr_provider.process_document(file_bytes, report_file.mime)
            report_file.page_count = file_ocr_result.page_count

            for p in file_ocr_result.pages:
                page_marker = f"--- Page {global_page_num} ---"
                full_text_parts.append(f"{page_marker}\n{p.text}")
                all_pages.append(OCRPage(page_number=global_page_num, text=p.text))
                global_page_num += 1

        combined_full_text = "\n\n".join(full_text_parts)
        ocr_result = OCRResult(
            full_text=combined_full_text,
            pages=all_pages,
            page_count=len(all_pages),
            detected_orientation_angle=0.0,
        )

        # Document-Type Auto-Detection
        doc_type = detect_document_type(ocr_result.full_text)
        report.document_type = doc_type
        await db.commit()

        # Remove any existing extracted values for this report (idempotency)
        for existing in list(report.extracted_values):
            await db.delete(existing)
        await db.flush()

        extracted_records = []

        # ---------------- Stage 2: Branch by Document Type ----------------
        if report.document_type == "prescription":
            # ---------------- Prescription Pipeline ----------------
            report.status = "extracting"
            await db.commit()

            prescription_extractor = PrescriptionExtractor()
            prescription_data = prescription_extractor.process_prescription(ocr_result.full_text)

            # Map medications to extracted values
            for idx, med in enumerate(prescription_data.medications, 1):
                # Check if medication is part of a severe drug-drug interaction
                is_critical = any(
                    inter.severity in ("CRITICAL", "SEVERE") and (
                        inter.drug_a.lower() in med.name.lower() or inter.drug_b.lower() in med.name.lower()
                    )
                    for inter in prescription_data.interactions
                )
                flag = "critical" if is_critical else "normal"

                rec = ExtractedValue(
                    id=str(uuid.uuid4()),
                    report_id=report.id,
                    test_name=f"Rx: {med.name} ({med.form})",
                    value=float(idx),
                    unit=med.frequency,
                    ref_low=None,
                    ref_high=None,
                    flag=flag,
                    page=1,
                )
                db.add(rec)
                extracted_records.append(rec)
            await db.flush()

            # Plain-language explanation with Doctor Banner & Daily Routine
            report.status = "simplifying"
            await db.commit()

            explanation_text = generate_prescription_explanation(
                data=prescription_data,
                patient_name=patient_info["name"],
                language=preferred_lang,
            )

            exp_record = Explanation(
                id=str(uuid.uuid4()),
                report_id=report.id,
                language=preferred_lang,
                text=explanation_text,
                audio_available=False,
            )
            db.add(exp_record)
            await db.flush()

        else:
            # ---------------- Lab Report Pipeline ----------------
            report.status = "extracting"
            await db.commit()

            extraction_result = await extraction_provider.extract_values(ocr_result)

            report.status = "flagging"
            await db.commit()

            for row in extraction_result.rows:
                flag, _ = evaluate_flag(
                    test_name=row.test_name,
                    value=row.value,
                    unit=row.unit,
                    ref_low=row.ref_low,
                    ref_high=row.ref_high,
                )

                extracted_record = ExtractedValue(
                    id=str(uuid.uuid4()),
                    report_id=report.id,
                    test_name=row.test_name,
                    value=row.value,
                    unit=row.unit,
                    ref_low=row.ref_low,
                    ref_high=row.ref_high,
                    flag=flag,
                    page=row.page,
                )
                db.add(extracted_record)
                extracted_records.append(extracted_record)

            await db.flush()

            # Simplification
            report.status = "simplifying"
            await db.commit()

            simplification_result = await simplifier.simplify_report(
                extracted_values=extracted_records,
                patient_info=patient_info,
                language=preferred_lang,
            )

            exp_record = Explanation(
                id=str(uuid.uuid4()),
                report_id=report.id,
                language=preferred_lang,
                text=simplification_result.plain_text,
                audio_available=False,
            )
            db.add(exp_record)
            await db.flush()
            explanation_text = simplification_result.plain_text

        # ---------------- Stage 5: Voice Synthesis (TTS) ----------------
        try:
            from app.pipeline.tts import get_tts_provider
            tts_provider = get_tts_provider()
            tts_res = await tts_provider.synthesize(
                text=explanation_text,
                language=preferred_lang
            )
            if tts_res.available and tts_res.audio_bytes:
                audio_key = f"audio/{report.id}_{preferred_lang}.mp3"
                await storage.upload_file(key=audio_key, data=tts_res.audio_bytes, mime_type="audio/mpeg")
                exp_record.audio_key = audio_key
                exp_record.audio_available = True
                await db.flush()
        except Exception as tts_err:
            logger.warning(f"Non-critical TTS audio generation notice: {tts_err}")

        # ---------------- Stage 6: Auto-Escalation Check ----------------
        await handle_report_escalations(report, extracted_records, db)

        # Pipeline complete!
        report.status = "ready"
        await db.commit()
        await db.refresh(report)
        return report

    except Exception as e:
        logger.exception(f"Pipeline error for report {report_id}: {e}")
        report.status = "failed"
        await db.commit()
        return report
