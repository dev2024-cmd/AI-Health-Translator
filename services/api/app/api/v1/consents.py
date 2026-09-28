from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.core.audit import log_audit_event
from app.models.consent import Consent
from app.schemas.consent import ConsentCreate, ConsentResponse

router = APIRouter(prefix="/consents", tags=["DPDP Consent Management"])


@router.post("", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def grant_consent(
    data: ConsentCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Explicitly grant consent for processing medical reports under India's DPDP Act 2023.
    """
    user_id = payload.get("sub")
    consent = Consent(
        user_id=user_id,
        purpose=data.purpose,
        granted_at=datetime.now(timezone.utc),
    )
    db.add(consent)
    await db.flush()

    await log_audit_event(
        session=db,
        action="CONSENT_GRANTED",
        entity="Consent",
        entity_id=consent.id,
        actor_id=user_id,
    )
    return consent


@router.get("", response_model=List[ConsentResponse])
async def list_consents(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List all consent records for the currently authenticated user.
    """
    user_id = payload.get("sub")
    res = await db.execute(
        select(Consent).where(Consent.user_id == user_id).order_by(Consent.granted_at.desc())
    )
    return res.scalars().all()


@router.post("/{consent_id}/revoke", response_model=ConsentResponse)
async def revoke_consent(
    consent_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Revoke a previously granted consent under the DPDP Act 2023.
    """
    user_id = payload.get("sub")
    res = await db.execute(
        select(Consent).where(Consent.id == consent_id, Consent.user_id == user_id)
    )
    consent = res.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent record not found")

    consent.revoked_at = datetime.now(timezone.utc)
    await db.flush()

    await log_audit_event(
        session=db,
        action="CONSENT_REVOKED",
        entity="Consent",
        entity_id=consent.id,
        actor_id=user_id,
    )
    return consent
