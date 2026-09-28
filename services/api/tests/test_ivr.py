import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.patient import Patient
from app.models.report import Report
from app.models.explanation import Explanation
from app.models.call_log import CallLog
from app.models.escalation import Escalation


@pytest.mark.asyncio
async def test_ivr_call_lifecycle_and_dtmf_flow(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_caregiver: dict,
):
    # Setup Patient & Report
    patient = Patient(
        id=str(uuid.uuid4()),
        display_name="Sita Ramulu (Father)",
        preferred_language="te",
        phone_for_ivr="+919666666666",
        phone_type="feature",
    )
    db_session.add(patient)

    report = Report(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        status="ready",
    )
    db_session.add(report)

    # Explanation in Telugu
    exp = Explanation(
        id=str(uuid.uuid4()),
        report_id=report.id,
        language="te",
        text="మీ హిమోగ్లోబిన్ [Hemoglobin] 11.2 గా ఉంది, ఇది సాధారణం కంటే తక్కువ.",
        audio_available=True,
    )
    db_session.add(exp)
    await db_session.commit()

    # 1. Initiate automated voice call
    call_res = await client.post(
        "/v1/telephony/call",
        json={"report_id": report.id, "patient_id": patient.id},
        headers=auth_headers_caregiver,
    )
    assert call_res.status_code == 201
    call_data = call_res.json()
    assert call_data["status"] == "in-progress"
    assert "నమస్కారం" in call_data["greeting_prompt"]
    call_id = call_data["call_id"]

    # 2. Press 1: Listen to standard explanation
    dtmf1_res = await client.post(
        "/v1/telephony/dtmf",
        json={"call_id": call_id, "digit": "1"},
        headers=auth_headers_caregiver,
    )
    assert dtmf1_res.status_code == 200
    res1_data = dtmf1_res.json()
    assert "[Hemoglobin]" in res1_data["spoken_response"]
    assert res1_data["should_hang_up"] is False

    # 3. Press 2: Listen slowly
    dtmf2_res = await client.post(
        "/v1/telephony/dtmf",
        json={"call_id": call_id, "digit": "2"},
        headers=auth_headers_caregiver,
    )
    assert dtmf2_res.status_code == 200
    res2_data = dtmf2_res.json()
    assert "[Hemoglobin]" in res2_data["spoken_response"]

    # 4. Press 0: Language Toggle (Telugu -> Hindi)
    dtmf0_res = await client.post(
        "/v1/telephony/dtmf",
        json={"call_id": call_id, "digit": "0"},
        headers=auth_headers_caregiver,
    )
    assert dtmf0_res.status_code == 200
    res0_data = dtmf0_res.json()
    assert "नमस्ते" in res0_data["spoken_response"]

    # 5. Press 3: Request Health Worker Callback
    dtmf3_res = await client.post(
        "/v1/telephony/dtmf",
        json={"call_id": call_id, "digit": "3"},
        headers=auth_headers_caregiver,
    )
    assert dtmf3_res.status_code == 200
    res3_data = dtmf3_res.json()
    assert res3_data["should_hang_up"] is True

    # 6. Verify Escalation ticket was automatically created in database
    esc_query = await db_session.execute(
        select(Escalation).where(Escalation.patient_id == patient.id)
    )
    escalation = esc_query.scalar_one_or_none()
    assert escalation is not None
    assert "Key 3" in escalation.reason

    # 7. Verify Call Log entry is completed
    log_query = await db_session.execute(select(CallLog).where(CallLog.id == call_id))
    log = log_query.scalar_one_or_none()
    assert log is not None
    assert log.status == "completed"
    assert len(log.keypad_events) >= 4
