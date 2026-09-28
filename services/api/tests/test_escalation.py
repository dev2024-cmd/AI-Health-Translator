import pytest
import uuid
from app.models.user import User
from app.models.report import Report
from app.models.patient import Patient
from app.models.health_worker import HealthWorker
from app.models.extracted_value import ExtractedValue
from app.models.escalation import Escalation
from app.pipeline.escalation.manager import handle_report_escalations
from sqlalchemy.future import select


@pytest.mark.asyncio
async def test_escalation_triggered_on_critical_value(db_session):
    # Setup test health worker user & profile
    hw_user = User(
        id=str(uuid.uuid4()),
        phone="+919888877777",
        role="health_worker",
        preferred_language="te",
    )
    db_session.add(hw_user)
    await db_session.flush()

    hw = HealthWorker(
        id=str(uuid.uuid4()),
        user_id=hw_user.id,
        region="Telangana",
        languages=["te", "en"],
        is_available=True,
    )
    db_session.add(hw)

    patient = Patient(
        id=str(uuid.uuid4()),
        display_name="Father Ramulu",
        preferred_language="te",
        phone_for_ivr="+919876543210",
        phone_type="feature",
    )
    db_session.add(patient)

    report = Report(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        uploaded_by=hw_user.id,
        status="flagging",
    )
    db_session.add(report)
    await db_session.flush()

    # Normal + Critical value
    values = [
        ExtractedValue(
            id=str(uuid.uuid4()),
            report_id=report.id,
            test_name="WBC Count",
            value=7200.0,
            unit="/mcL",
            ref_low=4000.0,
            ref_high=11000.0,
            flag="normal"
        ),
        ExtractedValue(
            id=str(uuid.uuid4()),
            report_id=report.id,
            test_name="Serum Potassium",
            value=6.8,
            unit="mmol/L",
            ref_low=3.5,
            ref_high=5.0,
            flag="critical"
        ),
    ]

    escalations = await handle_report_escalations(report, values, db_session)
    assert len(escalations) == 1
    assert escalations[0].status == "assigned"
    assert escalations[0].assigned_to == hw.id
    assert "Serum Potassium" in escalations[0].reason

    # Verify database record
    res = await db_session.execute(select(Escalation).where(Escalation.report_id == report.id))
    saved_esc = res.scalar_one_or_none()
    assert saved_esc is not None
    assert saved_esc.patient_id == patient.id


@pytest.mark.asyncio
async def test_no_escalation_for_normal_values(db_session):
    patient = Patient(
        id=str(uuid.uuid4()),
        display_name="Patient Safe",
        preferred_language="en",
        phone_for_ivr="+919876543211",
        phone_type="smart",
    )
    db_session.add(patient)

    report = Report(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        uploaded_by=None,
        status="flagging",
    )
    db_session.add(report)
    await db_session.flush()

    values = [
        ExtractedValue(
            id=str(uuid.uuid4()),
            report_id=report.id,
            test_name="Hemoglobin",
            value=14.0,
            unit="g/dL",
            ref_low=13.0,
            ref_high=17.0,
            flag="normal"
        ),
    ]

    escalations = await handle_report_escalations(report, values, db_session)
    assert len(escalations) == 0
