import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.patient import Patient
from app.models.report import Report
from app.models.extracted_value import ExtractedValue
from app.models.explanation import Explanation


@pytest.mark.asyncio
async def test_translate_report_and_fetch_audio(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_caregiver: dict,
):
    # Setup test patient & report
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
        status="ready",
    )
    db_session.add(report)

    val = ExtractedValue(
        id=str(uuid.uuid4()),
        report_id=report.id,
        test_name="Hemoglobin",
        value=11.2,
        unit="g/dL",
        ref_low=13.0,
        ref_high=17.0,
        flag="low"
    )
    db_session.add(val)

    # Base English explanation
    exp_en = Explanation(
        id=str(uuid.uuid4()),
        report_id=report.id,
        language="en",
        text="Hello, here is a simple explanation of your medical test results in plain words.\n• [Hemoglobin]: Your reading is 11.2 g/dL, which is lower than normal.",
        audio_available=False
    )
    db_session.add(exp_en)
    await db_session.commit()

    # 1. Request translation to Telugu (te)
    trans_res = await client.post(
        f"/v1/reports/{report.id}/translate",
        json={"target_language": "te"},
        headers=auth_headers_caregiver,
    )
    assert trans_res.status_code == 200
    data = trans_res.json()
    assert data["language"] == "te"
    assert "[Hemoglobin]" in data["text"]
    assert "నమస్కారం" in data["text"]
    assert data["audio_available"] is True
    assert data["audio_key"] is not None

    # 2. Fetch the synthesized audio file
    audio_res = await client.get(
        f"/v1/reports/{report.id}/audio/te",
        headers=auth_headers_caregiver,
    )
    assert audio_res.status_code == 200
    assert audio_res.headers["content-type"] == "audio/mpeg"
    assert len(audio_res.content) > 0

    # 3. Request translation to invalid language -> Expect 400
    bad_res = await client.post(
        f"/v1/reports/{report.id}/translate",
        json={"target_language": "klingon"},
        headers=auth_headers_caregiver,
    )
    assert bad_res.status_code == 400
    assert "Unsupported language code" in bad_res.json()["detail"]


@pytest.mark.asyncio
async def test_audio_request_for_voiceless_language_returns_422(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_caregiver: dict,
):
    patient = Patient(
        id=str(uuid.uuid4()),
        display_name="Santali Patient",
        preferred_language="sat",
        phone_for_ivr="+919876543211",
        phone_type="feature",
    )
    db_session.add(patient)

    report = Report(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        status="ready",
    )
    db_session.add(report)

    # Santali explanation with audio_available = False
    exp_sat = Explanation(
        id=str(uuid.uuid4()),
        report_id=report.id,
        language="sat",
        text="Santali translated explanation.",
        audio_available=False
    )
    db_session.add(exp_sat)
    await db_session.commit()

    # Attempting to fetch audio for voiceless language (sat) returns 422 with fallback suggestion
    audio_res = await client.get(
        f"/v1/reports/{report.id}/audio/sat",
        headers=auth_headers_caregiver,
    )
    assert audio_res.status_code == 422
    assert "Voice synthesis is not available" in audio_res.json()["detail"]
    assert "fallback" in audio_res.json()["detail"].lower()
