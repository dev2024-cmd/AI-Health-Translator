import io
import pytest
from PIL import Image
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.pipeline.runner import run_report_pipeline


def make_test_jpeg() -> bytes:
    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_upload_report_flow_with_consent_and_pipeline(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_caregiver: dict,
):
    # 1. Create a patient first
    patient_res = await client.post(
        "/v1/patients",
        json={
            "display_name": "Sita Ramulu (Father)",
            "preferred_language": "te",
            "phone_for_ivr": "+919666666666",
            "phone_type": "feature",
        },
        headers=auth_headers_caregiver,
    )
    assert patient_res.status_code == 201
    patient_id = patient_res.json()["id"]

    # 2. Try upload WITHOUT consent -> Expect 403
    jpeg_bytes = make_test_jpeg()
    files = [("files", ("report.jpg", jpeg_bytes, "image/jpeg"))]
    data = {"patient_id": patient_id, "source": "app"}

    no_consent_res = await client.post(
        "/v1/reports",
        data=data,
        files=files,
        headers=auth_headers_caregiver,
    )
    assert no_consent_res.status_code == 403
    assert "DPDP" in no_consent_res.json()["detail"]

    # 3. Grant DPDP Consent
    consent_res = await client.post(
        "/v1/consents",
        json={"purpose": "medical_report_ocr_simplification_and_voice_assistance"},
        headers=auth_headers_caregiver,
    )
    assert consent_res.status_code == 201

    # 4. Upload with corrupted magic bytes -> Expect 400
    bad_files = [("files", ("fake.jpg", b"this_is_not_a_valid_jpeg_header", "image/jpeg"))]
    bad_res = await client.post(
        "/v1/reports",
        data=data,
        files=bad_files,
        headers=auth_headers_caregiver,
    )
    assert bad_res.status_code == 400
    assert "signature" in bad_res.json()["detail"]

    # 5. Successful Report Upload
    valid_files = [("files", ("blood_report.jpg", jpeg_bytes, "image/jpeg"))]
    upload_res = await client.post(
        "/v1/reports",
        data=data,
        files=valid_files,
        headers=auth_headers_caregiver,
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert upload_data["status"] == "uploaded"
    assert upload_data["files_uploaded"] == 1
    report_id = upload_data["report_id"]

    # 6. Execute pipeline runner on report
    updated_report = await run_report_pipeline(report_id, db_session)
    assert updated_report is not None
    assert updated_report.status == "ready"

    # 7. Poll report details endpoint
    detail_res = await client.get(
        f"/v1/reports/{report_id}",
        headers=auth_headers_caregiver,
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["status"] == "ready"
    assert len(detail_data["files"]) == 1
    assert len(detail_data["extracted_values"]) >= 1

    extracted_names = [v["test_name"] for v in detail_data["extracted_values"]]
    assert any("Hemoglobin" in name or "Cholesterol" in name for name in extracted_names)

    # 8. List reports
    list_res = await client.get("/v1/reports", headers=auth_headers_caregiver)
    assert list_res.status_code == 200
    reports = list_res.json()
    assert any(r["id"] == report_id for r in reports)

    # 9. DPDP Right to Erasure (DELETE /reports/{id})
    delete_res = await client.delete(
        f"/v1/reports/{report_id}",
        headers=auth_headers_caregiver,
    )
    assert delete_res.status_code == 204

    # Confirm report is gone
    not_found_res = await client.get(
        f"/v1/reports/{report_id}",
        headers=auth_headers_caregiver,
    )
    assert not_found_res.status_code == 404
