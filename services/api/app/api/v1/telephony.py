"""
Telephony Endpoints: IVR Voice Call Simulator & SMS Delivery.
Enables feature phone users and rural patients to receive voice and text report summaries.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.patient import Patient
from app.models.report import Report
from app.models.call_log import CallLog
from app.telephony import (
    get_telephony_provider,
    process_dtmf_digit,
    format_report_sms,
)

router = APIRouter(prefix="/telephony", tags=["Telephony & IVR"])


class InitiateCallRequest(BaseModel):
    report_id: str
    patient_id: str


class DTMFRequest(BaseModel):
    call_id: str
    digit: str


class SendSMSRequest(BaseModel):
    report_id: str
    patient_id: str


class CallLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    report_id: str
    channel: str
    provider_sid: Optional[str] = None
    status: str
    keypad_events: Optional[List[dict]] = None
    created_at: datetime


@router.post("/call", status_code=status.HTTP_201_CREATED)
async def initiate_ivr_call(
    req: InitiateCallRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers an automated voice call (IVR) to the patient's feature phone with the medical report.
    """
    patient_res = await db.execute(select(Patient).where(Patient.id == req.patient_id))
    patient = patient_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if not patient.phone_for_ivr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient has no registered phone number for voice IVR calls.",
        )

    provider = get_telephony_provider()
    call_res = await provider.initiate_call(
        to_phone=patient.phone_for_ivr,
        report_id=req.report_id,
        patient_id=req.patient_id,
        db=db,
    )

    return call_res.to_dict()


@router.post("/dtmf")
async def handle_dtmf_press(
    req: DTMFRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Handles DTMF keypad digit input (1, 2, 3, 0) during an ongoing voice IVR call.
    - 1: Listen to standard explanation
    - 2: Listen slowly (0.8x)
    - 3: Request community health worker callback ticket
    - 0: Toggle language (Telugu / Hindi / English)
    """
    res = await db.execute(select(CallLog).where(CallLog.id == req.call_id))
    call_log = res.scalar_one_or_none()
    if not call_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call session not found")

    spoken_response, should_hang_up, next_action = await process_dtmf_digit(
        call_log=call_log,
        digit=req.digit,
        db=db,
    )

    if should_hang_up:
        call_log.status = "completed"
        await db.commit()

    return {
        "call_id": req.call_id,
        "digit_pressed": req.digit,
        "spoken_response": spoken_response,
        "should_hang_up": should_hang_up,
        "next_action": next_action,
    }


@router.post("/sms", status_code=status.HTTP_201_CREATED)
async def send_report_sms(
    req: SendSMSRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Dispatches a 160-character plain-language SMS summary to the patient's phone.
    """
    patient_res = await db.execute(select(Patient).where(Patient.id == req.patient_id))
    patient = patient_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    report_res = await db.execute(
        select(Report)
        .options(selectinload(Report.extracted_values))
        .where(Report.id == req.report_id)
    )
    report = report_res.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # Format 160-char SMS
    sms_text = format_report_sms(
        patient_name=patient.display_name,
        extracted_values=report.extracted_values,
        language=patient.preferred_language,
    )

    provider = get_telephony_provider()
    sms_res = await provider.send_sms(
        to_phone=patient.phone_for_ivr,
        message=sms_text,
        report_id=req.report_id,
        patient_id=req.patient_id,
        db=db,
    )

    return sms_res.to_dict()


@router.get("/call-logs", response_model=List[CallLogResponse])
async def list_call_logs(
    patient_id: Optional[str] = None,
    channel: Optional[str] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists telephony interaction history, DTMF audit trails, and delivery statuses.
    """
    stmt = select(CallLog).order_by(CallLog.created_at.desc())
    if patient_id:
        stmt = stmt.where(CallLog.patient_id == patient_id)
    if channel:
        stmt = stmt.where(CallLog.channel == channel)

    res = await db.execute(stmt)
    return res.scalars().all()
