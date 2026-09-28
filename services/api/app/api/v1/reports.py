import uuid
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    BackgroundTasks,
    Response,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.core.audit import log_audit_event
from app.core.languages import is_valid_language, get_language_config
from app.storage import get_storage_service
from app.models.user import User
from app.models.patient import Patient
from app.models.caregiver import CaregiverLink
from app.models.report import Report
from app.models.report_file import ReportFile
from app.models.explanation import Explanation
from app.models.consent import Consent
from app.pipeline.queue import enqueue_report_job
from app.pipeline.translation import get_translation_provider
from app.pipeline.tts import get_tts_provider
from app.pipeline.simplification import get_simplifier
from app.schemas.report import (
    ReportResponse,
    ReportUploadResponse,
    ExplanationResponse,
    TranslationRequest,
)

router = APIRouter(prefix="/reports", tags=["Reports"])

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
}

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def validate_file_magic_bytes(content: bytes, declared_mime: str) -> bool:
    """Validate file signatures (magic bytes) to prevent malicious upload masquerading."""
    if declared_mime in ("image/jpeg", "image/jpg"):
        return content.startswith(b"\xff\xd8\xff")
    if declared_mime == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if declared_mime == "application/pdf":
        return content.startswith(b"%PDF-")
    return False


@router.post("", response_model=ReportUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_report(
    background_tasks: BackgroundTasks,
    patient_id: str = Form(...),
    source: str = Form("app"),
    original_language: str = Form("en"),
    files: List[UploadFile] = File(...),
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload one or more medical report images (JPEG, PNG) or multi-page PDF documents.
    Verifies user consent under India's DPDP Act 2023, stores files encrypted at rest in S3/MinIO,
    and enqueues the AI pipeline background processing.
    """
    user_id = payload.get("sub")
    user_role = payload.get("role")

    # 1. DPDP Act 2023: Check explicit active consent
    consent_query = await db.execute(
        select(Consent).where(
            Consent.user_id == user_id,
            Consent.revoked_at.is_(None),
        )
    )
    active_consent = consent_query.scalar_one_or_none()
    if not active_consent and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DPDP Act 2023 Consent required before uploading health reports. Please review and grant consent at /v1/consents.",
        )

    # 2. Verify Patient exists and user has authorization
    patient_res = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = patient_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Patient permission check
    if user_role == "patient" and patient.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot upload report for another patient")
    elif user_role == "caregiver":
        link_res = await db.execute(
            select(CaregiverLink).where(
                CaregiverLink.caregiver_id == user_id,
                CaregiverLink.patient_id == patient_id,
                CaregiverLink.status == "active",
            )
        )
        if not link_res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this patient")

    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    # 3. Create Report Entity
    report = Report(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        uploaded_by=user_id,
        source=source,
        status="uploaded",
        original_language=original_language,
    )
    db.add(report)
    await db.flush()

    storage = get_storage_service()
    uploaded_files_count = 0

    # 4. Validate and store each file
    for file in files:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File '{file.filename}' exceeds maximum allowed size of 25MB.",
            )

        mime = file.content_type or "application/octet-stream"
        if mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{mime}'. Allowed types: JPG, PNG, PDF.",
            )

        # Validate magic bytes
        if not validate_file_magic_bytes(content, mime):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Corrupted or invalid file signature for '{file.filename}'.",
            )

        # Generate encrypted storage key
        file_ext = ALLOWED_MIME_TYPES[mime]
        storage_key = f"reports/{report.id}/{uuid.uuid4()}{file_ext}"

        await storage.upload_file(key=storage_key, data=content, mime_type=mime)

        report_file = ReportFile(
            id=str(uuid.uuid4()),
            report_id=report.id,
            storage_key=storage_key,
            mime=mime,
            page_count=1,
            page_order=uploaded_files_count + 1,
        )
        db.add(report_file)
        uploaded_files_count += 1

    await db.flush()

    # 5. Audit Log Entry
    await log_audit_event(
        session=db,
        action="REPORT_UPLOADED",
        entity="Report",
        entity_id=report.id,
        actor_id=user_id,
    )
    await db.commit()

    # 6. Schedule Background AI Pipeline Execution
    enqueue_report_job(report.id, background_tasks)

    return ReportUploadResponse(
        report_id=report.id,
        status=report.status,
        message="Report uploaded successfully and queued for AI analysis.",
        files_uploaded=uploaded_files_count,
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report_details(
    report_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve report processing status, extracted values, explanations, and metadata.
    """
    user_id = payload.get("sub")
    user_role = payload.get("role")

    query = await db.execute(
        select(Report)
        .options(
            selectinload(Report.files),
            selectinload(Report.extracted_values),
            selectinload(Report.explanations),
        )
        .where(Report.id == report_id)
    )
    report = query.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # Access control
    if user_role == "patient":
        patient_res = await db.execute(select(Patient).where(Patient.id == report.patient_id))
        patient = patient_res.scalar_one_or_none()
        if not patient or patient.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # DPDP Audit Log on read
    await log_audit_event(
        session=db,
        action="REPORT_ACCESSED",
        entity="Report",
        entity_id=report.id,
        actor_id=user_id,
    )

    return report


@router.get("", response_model=List[ReportResponse])
async def list_reports(
    patient_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List reports accessible to the authenticated user.
    """
    user_id = payload.get("sub")
    user_role = payload.get("role")

    stmt = select(Report).options(
        selectinload(Report.files),
        selectinload(Report.extracted_values),
        selectinload(Report.explanations),
    ).order_by(Report.created_at.desc())

    if patient_id:
        stmt = stmt.where(Report.patient_id == patient_id)
    elif user_role == "patient":
        pat_query = await db.execute(select(Patient.id).where(Patient.user_id == user_id))
        pat_ids = pat_query.scalars().all()
        stmt = stmt.where(Report.patient_id.in_(pat_ids))
    elif user_role == "caregiver":
        link_query = await db.execute(
            select(CaregiverLink.patient_id).where(
                CaregiverLink.caregiver_id == user_id,
                CaregiverLink.status == "active",
            )
        )
        pat_ids = link_query.scalars().all()
        stmt = stmt.where(Report.patient_id.in_(pat_ids))

    if status_filter:
        stmt = stmt.where(Report.status == status_filter)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    DPDP Act 2023 Right to Erasure: Permanently deletes medical report, raw files, and all extracted data.
    """
    user_id = payload.get("sub")
    user_role = payload.get("role")

    res = await db.execute(
        select(Report).options(selectinload(Report.files)).where(Report.id == report_id)
    )
    report = res.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    if user_role not in ("admin", "health_worker") and report.uploaded_by != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    storage = get_storage_service()
    for file in report.files:
        await storage.delete_file(file.storage_key)

    await db.delete(report)
    await log_audit_event(
        session=db,
        action="REPORT_DELETED",
        entity="Report",
        entity_id=report_id,
        actor_id=user_id,
    )
    await db.commit()


@router.post("/{report_id}/translate", response_model=ExplanationResponse)
async def translate_report_explanation(
    report_id: str,
    req: TranslationRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Translates report explanation into any of the 22 scheduled Indian languages.
    Preserves original English clinical terms in brackets and generates TTS speech audio.
    """
    target_lang = req.target_language.lower()
    if not is_valid_language(target_lang):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language code '{target_lang}'. Must be one of the 22 scheduled languages or English.",
        )

    # Fetch report with explanations and extracted values
    res = await db.execute(
        select(Report)
        .options(
            selectinload(Report.extracted_values),
            selectinload(Report.explanations)
        )
        .where(Report.id == report_id)
    )
    report = res.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # Check if explanation in target language already exists
    existing = next((exp for exp in report.explanations if exp.language == target_lang), None)
    if existing and existing.audio_available:
        return existing

    # Find base English explanation or generate it
    base_explanation = next((exp for exp in report.explanations if exp.language == "en"), None)
    if not base_explanation:
        if report.explanations:
            base_explanation = report.explanations[0]
        else:
            simplifier = get_simplifier()
            sim_res = await simplifier.simplify_report(report.extracted_values, language="en")
            base_explanation = Explanation(
                id=str(uuid.uuid4()),
                report_id=report.id,
                language="en",
                text=sim_res.plain_text,
                audio_available=False
            )
            db.add(base_explanation)
            await db.flush()

    # Step 1: Run translation provider
    translator = get_translation_provider()
    trans_res = await translator.translate_explanation(
        text=base_explanation.text,
        target_language=target_lang,
        source_language="en"
    )

    # Step 2: Run TTS provider for voice synthesis
    tts_provider = get_tts_provider()
    tts_res = await tts_provider.synthesize(text=trans_res.translated_text, language=target_lang)

    storage = get_storage_service()
    audio_key = None
    audio_available = False

    if tts_res.available and tts_res.audio_bytes:
        audio_key = f"audio/{report.id}_{target_lang}.mp3"
        await storage.upload_file(key=audio_key, data=tts_res.audio_bytes, mime_type="audio/mpeg")
        audio_available = True

    # Persist or update explanation
    if existing:
        existing.text = trans_res.translated_text
        existing.audio_key = audio_key
        existing.audio_available = audio_available
        explanation_record = existing
    else:
        explanation_record = Explanation(
            id=str(uuid.uuid4()),
            report_id=report.id,
            language=target_lang,
            text=trans_res.translated_text,
            audio_key=audio_key,
            audio_available=audio_available,
        )
        db.add(explanation_record)

    await db.commit()
    await db.refresh(explanation_record)
    return explanation_record


@router.get("/{report_id}/audio/{language}")
async def get_report_audio(
    report_id: str,
    language: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Streams synthesized voice explanation audio in the requested language.
    """
    lang = language.lower()
    res = await db.execute(
        select(Explanation).where(
            Explanation.report_id == report_id,
            Explanation.language == lang,
        )
    )
    explanation = res.scalar_one_or_none()
    if not explanation or not explanation.audio_available or not explanation.audio_key:
        lang_config = get_language_config(lang)
        if not lang_config.get("tts_available", False):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Voice synthesis is not available for '{lang_config['name']}'. Please use fallback: '{lang_config.get('fallback_language', 'en')}'.",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio for language '{lang}' not generated yet. Call POST /v1/reports/{report_id}/translate first.",
        )

    storage = get_storage_service()
    audio_bytes = await storage.download_file(explanation.audio_key)

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"inline; filename=report_{report_id}_{lang}.mp3",
            "Cache-Control": "public, max-age=86400",
        },
    )
