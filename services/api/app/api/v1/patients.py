from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload, sanitize_phone
from app.core.audit import log_audit_event
from app.models.patient import Patient
from app.models.caregiver import CaregiverLink
from app.models.user import User
from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
    CaregiverLinkCreate,
    CaregiverLinkResponse,
)

router = APIRouter(tags=["Patients"])


@router.get("/patients", response_model=List[PatientResponse])
async def list_patients(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List all patients accessible by the authenticated user.
    - Patient sees their own patient profile.
    - Caregiver sees patients linked to their account.
    - Health Worker / Admin can see all patients.
    """
    user_id = payload.get("sub")
    role = payload.get("role")

    if role in ["health_worker", "admin"]:
        result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
        return result.scalars().all()

    if role == "caregiver":
        result = await db.execute(
            select(Patient)
            .join(CaregiverLink, CaregiverLink.patient_id == Patient.id)
            .where(CaregiverLink.caregiver_id == user_id, CaregiverLink.status == "active")
            .order_by(Patient.created_at.desc())
        )
        return result.scalars().all()

    # Default patient role: sees their own patient record
    result = await db.execute(select(Patient).where(Patient.user_id == user_id))
    return result.scalars().all()


@router.post("/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new patient record (e.g., when a caregiver sets up an account for an elderly parent).
    """
    user_id = payload.get("sub")
    role = payload.get("role")

    clean_ivr_phone = sanitize_phone(data.phone_for_ivr)
    patient = Patient(
        user_id=user_id if role == "patient" else None,
        display_name=data.display_name,
        preferred_language=data.preferred_language,
        phone_for_ivr=clean_ivr_phone,
        phone_type=data.phone_type,
    )
    db.add(patient)
    await db.flush()

    # If created by a caregiver, automatically link them
    if role == "caregiver":
        link = CaregiverLink(
            caregiver_id=user_id,
            patient_id=patient.id,
            status="active",
        )
        db.add(link)
        await db.flush()

    await log_audit_event(
        session=db,
        action="PATIENT_CREATED",
        entity="Patient",
        entity_id=patient.id,
        actor_id=user_id,
    )

    return patient


@router.post("/caregiver-links", response_model=CaregiverLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_caregiver_link(
    data: CaregiverLinkCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Link a caregiver to an existing patient.
    """
    user_id = payload.get("sub")

    # Verify patient exists
    res = await db.execute(select(Patient).where(Patient.id == data.patient_id))
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Check for existing link
    res_link = await db.execute(
        select(CaregiverLink).where(
            CaregiverLink.caregiver_id == user_id,
            CaregiverLink.patient_id == data.patient_id,
        )
    )
    existing_link = res_link.scalar_one_or_none()
    if existing_link:
        existing_link.status = "active"
        await db.flush()
        return existing_link

    link = CaregiverLink(
        caregiver_id=user_id,
        patient_id=data.patient_id,
        status="active",
    )
    db.add(link)
    await db.flush()

    await log_audit_event(
        session=db,
        action="CAREGIVER_LINK_CREATED",
        entity="CaregiverLink",
        entity_id=link.id,
        actor_id=user_id,
    )

    return link
