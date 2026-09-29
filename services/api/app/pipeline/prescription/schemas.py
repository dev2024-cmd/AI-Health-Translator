from typing import List, Optional
from pydantic import BaseModel, Field


class PrescribedMedication(BaseModel):
    name: str
    form: str = "Tablet"  # Tablet, Capsule, Syrup, Drops, Injection, Inhaler, Ointment
    strength: Optional[str] = None  # e.g., "500 mg", "10 mg"
    frequency: str = "Once daily"  # e.g., "1-0-1", "Twice daily", "TDS"
    timing: str = "After food"  # "After food", "Before food", "With meals", "At bedtime"
    duration: Optional[str] = None  # e.g., "5 days", "1 month"
    daily_schedule: str = ""  # Plain-language schedule e.g., "Take 1 tablet in the morning after breakfast and 1 at night before bed"
    special_instructions: Optional[str] = None
    what_it_is: Optional[str] = None
    what_it_is_for: Optional[str] = None
    what_it_will_do: Optional[str] = None


class DrugInteraction(BaseModel):
    drug_a: str
    drug_b: str
    severity: str  # "CRITICAL", "SEVERE", "MODERATE"
    description: str
    clinical_advice: str


class PrescriptionData(BaseModel):
    doctor_name: str = "Your Doctor"
    clinic_name: Optional[str] = None
    date: Optional[str] = None
    medications: List[PrescribedMedication] = Field(default_factory=list)
    interactions: List[DrugInteraction] = Field(default_factory=list)
    safety_notes: List[str] = Field(default_factory=list)
