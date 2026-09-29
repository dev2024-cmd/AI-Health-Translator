from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class ReminderCreate(BaseModel):
    patient_id: str = Field(..., description="ID of the family member / patient")
    patient_name: str = Field(..., min_length=1, max_length=100)
    type: Literal["medication", "checkup"] = "medication"
    title: str = Field(..., min_length=1, max_length=200, description="Medication name or checkup title")
    dosage: Optional[str] = Field(None, max_length=100, description="e.g. 1 tablet after meals")
    scheduled_time: str = Field(..., max_length=50, description="e.g. 08:00 AM or date/time")
    period: Optional[Literal["morning", "afternoon", "night", "checkup"]] = "morning"
    days: Optional[str] = Field("Daily", max_length=100)
    notify_family: bool = Field(True, description="Whether to alert family members/caregiver")
    notes: Optional[str] = None


class ReminderUpdate(BaseModel):
    status: Optional[Literal["pending", "taken", "missed", "completed"]] = None
    notes: Optional[str] = None


class FamilyNotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    reminder_id: Optional[str] = None
    patient_id: str
    from_patient_name: str
    notification_type: str
    message: str
    urgency: str
    read_status: bool
    created_at: datetime


class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    patient_name: str
    created_by_user_id: str
    type: str
    title: str
    dosage: Optional[str] = None
    scheduled_time: str
    period: Optional[str] = None
    days: Optional[str] = None
    notify_family: bool
    status: str
    last_taken_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime


class FamilyAlertPingRequest(BaseModel):
    custom_message: Optional[str] = Field(None, description="Optional custom alert message for family members")
    urgency: Literal["normal", "urgent"] = "urgent"


class FamilyFeedResponse(BaseModel):
    active_reminders_count: int
    pending_doses_count: int
    upcoming_checkups_count: int
    notifications: List[FamilyNotificationResponse]
    reminders: List[ReminderResponse]
