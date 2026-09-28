import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Patient
from app.models.report import Report
from app.models.extracted_value import ExtractedValue
from app.telephony.sms_formatter import format_report_sms


def test_sms_format_under_160_characters():
    values = [
        ExtractedValue(id="1", test_name="Hemoglobin", value=11.2, unit="g/dL", flag="low"),
        ExtractedValue(id="2", test_name="Platelets", value=220000.0, unit="/mcL", flag="normal"),
    ]

    sms_en = format_report_sms("Sita Ramulu", values, language="en")
    assert len(sms_en) <= 160
    assert "Hemoglobin 11.2 (Low)" in sms_en
    assert "1800-111-222" in sms_en

    sms_te = format_report_sms("Sita Ramulu", values, language="te")
    assert len(sms_te) <= 160
    assert "తక్కువ" in sms_te

    sms_hi = format_report_sms("Sita Ramulu", values, language="hi")
    assert len(sms_hi) <= 160
    assert "कम" in sms_hi


@pytest.mark.asyncio
async def test_send_sms_endpoint_and_call_log(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_caregiver: dict,
):
    patient = Patient(
        id=str(uuid.uuid4()),
        display_name="Father Ramulu",
        preferred_language="hi",
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

    val = ExtractedValue(
        id=str(uuid.uuid4()),
        report_id=report.id,
        test_name="Glucose",
        value=145.0,
        unit="mg/dL",
        flag="high"
    )
    db_session.add(val)
    await db_session.commit()

    # Send SMS
    sms_res = await client.post(
        "/v1/telephony/sms",
        json={"report_id": report.id, "patient_id": patient.id},
        headers=auth_headers_caregiver,
    )
    assert sms_res.status_code == 201
    sms_data = sms_res.json()
    assert sms_data["status"] == "delivered"
    assert "Glucose" in sms_data["body"]
    assert sms_data["channel"] == "sms"

    # Query call logs
    logs_res = await client.get(
        f"/v1/telephony/call-logs?patient_id={patient.id}",
        headers=auth_headers_caregiver,
    )
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 1
    assert logs[0]["channel"] == "sms"
