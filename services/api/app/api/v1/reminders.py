import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.core.audit import log_audit_event
from app.models.reminder import Reminder, FamilyNotification
from app.models.patient import Patient
from app.models.caregiver import CaregiverLink
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    FamilyNotificationResponse,
    FamilyFeedResponse,
    FamilyAlertPingRequest,
)

router = APIRouter(prefix="/reminders", tags=["Family Reminders & Notifications"])

# Seed realistic initial family reminders if table is empty
INITIAL_FAMILY_SEEDS = [
    {
        "patient_id": "pat-1",
        "patient_name": "Sita Ramulu (Father)",
        "type": "medication",
        "title": "Metformin 500mg",
        "dosage": "1 tablet after meals",
        "scheduled_time": "08:00 AM",
        "period": "morning",
        "days": "Daily",
        "notify_family": True,
        "status": "pending",
        "notes": "Prescribed for blood glucose control",
    },
    {
        "patient_id": "pat-1",
        "patient_name": "Sita Ramulu (Father)",
        "type": "medication",
        "title": "Atorvastatin 10mg",
        "dosage": "1 tablet before bed",
        "scheduled_time": "08:30 PM",
        "period": "night",
        "days": "Daily",
        "notify_family": True,
        "status": "pending",
        "notes": "Cholesterol maintenance",
    },
    {
        "patient_id": "pat-3",
        "patient_name": "Lakshmi Devi (Mother)",
        "type": "checkup",
        "title": "HbA1c Blood Sugar Review",
        "dosage": "Fasting blood sample",
        "scheduled_time": "30 Sep 2026, 09:00 AM",
        "period": "checkup",
        "days": "Quarterly",
        "notify_family": True,
        "status": "pending",
        "notes": "Follow-up test recommended by Dr. Sharma",
    },
    {
        "patient_id": "pat-2",
        "patient_name": "Ramesh Patel (Grandfather)",
        "type": "medication",
        "title": "Amlodipine 5mg",
        "dosage": "1 tablet morning",
        "scheduled_time": "07:30 AM",
        "period": "morning",
        "days": "Daily",
        "notify_family": True,
        "status": "taken",
        "notes": "Blood pressure management",
    },
]


async def _seed_initial_reminders_if_needed(db: AsyncSession, user_id: str):
    check_query = await db.execute(select(Reminder))
    existing = check_query.scalars().first()
    if not existing:
        for seed in INITIAL_FAMILY_SEEDS:
            r = Reminder(
                id=str(uuid.uuid4()),
                patient_id=seed["patient_id"],
                patient_name=seed["patient_name"],
                created_by_user_id=user_id,
                type=seed["type"],
                title=seed["title"],
                dosage=seed["dosage"],
                scheduled_time=seed["scheduled_time"],
                period=seed["period"],
                days=seed["days"],
                notify_family=seed["notify_family"],
                status=seed["status"],
                notes=seed["notes"],
            )
            db.add(r)
            # Create corresponding notification
            notif = FamilyNotification(
                id=str(uuid.uuid4()),
                reminder_id=r.id,
                patient_id=seed["patient_id"],
                from_patient_name=seed["patient_name"],
                to_user_id=user_id,
                notification_type="medication_due" if seed["type"] == "medication" else "checkup_due",
                message=f"🔔 Scheduled Alert: {seed['patient_name']} - {seed['title']} ({seed['scheduled_time']})",
                urgency="normal",
                read_status=False,
            )
            db.add(notif)
        await db.commit()


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_in: ReminderCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new medication or checkup reminder for a family member.
    If notify_family is True, broadcasts a notification alert to linked caregivers.
    """
    user_id = payload.get("sub", "usr-demo")

    reminder = Reminder(
        id=str(uuid.uuid4()),
        patient_id=reminder_in.patient_id,
        patient_name=reminder_in.patient_name,
        created_by_user_id=user_id,
        type=reminder_in.type,
        title=reminder_in.title,
        dosage=reminder_in.dosage,
        scheduled_time=reminder_in.scheduled_time,
        period=reminder_in.period,
        days=reminder_in.days or "Daily",
        notify_family=reminder_in.notify_family,
        status="pending",
        notes=reminder_in.notes,
    )
    db.add(reminder)
    await db.flush()

    # Automatically broadcast notification to family members/caregiver if enabled
    if reminder_in.notify_family:
        notification_message = (
            f"🔔 New Reminder: {reminder.patient_name} scheduled for {reminder.title} "
            f"at {reminder.scheduled_time}{f' ({reminder.dosage})' if reminder.dosage else ''}."
        )
        notif = FamilyNotification(
            id=str(uuid.uuid4()),
            reminder_id=reminder.id,
            patient_id=reminder.patient_id,
            from_patient_name=reminder.patient_name,
            to_user_id=user_id,
            notification_type="medication_due" if reminder.type == "medication" else "checkup_due",
            message=notification_message,
            urgency="normal",
            read_status=False,
        )
        db.add(notif)

    await log_audit_event(
        session=db,
        action="REMINDER_CREATED",
        entity="Reminder",
        entity_id=reminder.id,
        actor_id=user_id,
    )
    await db.commit()
    await db.refresh(reminder)
    return reminder


@router.get("", response_model=List[ReminderResponse])
async def list_reminders(
    patient_id: Optional[str] = Query(None, description="Filter by specific family member/patient ID"),
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List all medication and checkup reminders for the family.
    """
    user_id = payload.get("sub", "usr-demo")
    await _seed_initial_reminders_if_needed(db, user_id)

    query = select(Reminder)
    if patient_id and patient_id != "all":
        query = query.where(Reminder.patient_id == patient_id)

    query = query.order_by(Reminder.created_at.desc())
    res = await db.execute(query)
    return res.scalars().all()


@router.patch("/{reminder_id}/status", response_model=ReminderResponse)
async def update_reminder_status(
    reminder_id: str,
    update_data: ReminderUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Update reminder status (e.g. mark as 'taken', 'missed', or 'pending').
    Generates automatic cross-family status broadcast alerts.
    """
    user_id = payload.get("sub", "usr-demo")
    res = await db.execute(select(Reminder).where(Reminder.id == reminder_id))
    reminder = res.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    new_status = update_data.status or reminder.status
    reminder.status = new_status
    if update_data.notes is not None:
        reminder.notes = update_data.notes

    if new_status == "taken":
        reminder.last_taken_at = datetime.now(timezone.utc)
        # Notify family members of confirmed dose
        if reminder.notify_family:
            taken_msg = f"✅ Dose Taken: {reminder.patient_name} has taken {reminder.title} ({reminder.scheduled_time})."
            notif = FamilyNotification(
                id=str(uuid.uuid4()),
                reminder_id=reminder.id,
                patient_id=reminder.patient_id,
                from_patient_name=reminder.patient_name,
                to_user_id=user_id,
                notification_type="medication_taken",
                message=taken_msg,
                urgency="normal",
                read_status=False,
            )
            db.add(notif)
    elif new_status == "missed":
        # Alert family members that medication was missed
        if reminder.notify_family:
            missed_msg = f"⚠️ Missed Dose Alert: {reminder.patient_name} has missed {reminder.title} ({reminder.scheduled_time})!"
            notif = FamilyNotification(
                id=str(uuid.uuid4()),
                reminder_id=reminder.id,
                patient_id=reminder.patient_id,
                from_patient_name=reminder.patient_name,
                to_user_id=user_id,
                notification_type="missed_alert",
                message=missed_msg,
                urgency="urgent",
                read_status=False,
            )
            db.add(notif)

    await db.commit()
    await db.refresh(reminder)
    return reminder


@router.post("/{reminder_id}/ping-family", response_model=FamilyNotificationResponse)
async def ping_family_alert(
    reminder_id: str,
    ping_data: FamilyAlertPingRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually send an urgent family alert notification for a specific reminder.
    Example: Caregiver nudges family member to take medicine or alerts other family members.
    """
    user_id = payload.get("sub", "usr-demo")
    res = await db.execute(select(Reminder).where(Reminder.id == reminder_id))
    reminder = res.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    alert_text = (
        ping_data.custom_message
        or f"📢 Family Reminder: Please check on {reminder.patient_name} for {reminder.title} ({reminder.scheduled_time})."
    )

    notif = FamilyNotification(
        id=str(uuid.uuid4()),
        reminder_id=reminder.id,
        patient_id=reminder.patient_id,
        from_patient_name=reminder.patient_name,
        to_user_id=user_id,
        notification_type="medication_due",
        message=alert_text,
        urgency=ping_data.urgency,
        read_status=False,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


@router.get("/family-feed", response_model=FamilyFeedResponse)
async def get_family_notifications_feed(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Get live cross-family notification feed and summary counters across all linked family members.
    """
    user_id = payload.get("sub", "usr-demo")
    await _seed_initial_reminders_if_needed(db, user_id)

    # 1. Fetch recent notifications
    notifs_query = (
        select(FamilyNotification)
        .order_by(FamilyNotification.created_at.desc())
        .limit(20)
    )
    notifs_res = await db.execute(notifs_query)
    notifications = notifs_res.scalars().all()

    # 2. Fetch all active reminders
    reminders_query = select(Reminder).order_by(Reminder.scheduled_time.asc())
    reminders_res = await db.execute(reminders_query)
    reminders = reminders_res.scalars().all()

    pending_doses = [r for r in reminders if r.type == "medication" and r.status == "pending"]
    upcoming_checkups = [r for r in reminders if r.type == "checkup"]

    return FamilyFeedResponse(
        active_reminders_count=len(reminders),
        pending_doses_count=len(pending_doses),
        upcoming_checkups_count=len(upcoming_checkups),
        notifications=notifications,
        reminders=reminders,
    )


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a medication or checkup reminder.
    """
    user_id = payload.get("sub", "usr-demo")
    res = await db.execute(select(Reminder).where(Reminder.id == reminder_id))
    reminder = res.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    await db.delete(reminder)
    await log_audit_event(
        session=db,
        action="REMINDER_DELETED",
        entity="Reminder",
        entity_id=reminder_id,
        actor_id=user_id,
    )
    await db.commit()
    return None
