import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_consent_lifecycle(client: AsyncClient, auth_headers_patient: dict):
    # 1. Grant consent
    grant_res = await client.post(
        "/v1/consents",
        json={"purpose": "medical_report_ocr_simplification_and_voice_assistance"},
        headers=auth_headers_patient,
    )
    assert grant_res.status_code == 201
    consent_data = grant_res.json()
    assert consent_data["purpose"] == "medical_report_ocr_simplification_and_voice_assistance"
    assert consent_data["revoked_at"] is None
    consent_id = consent_data["id"]

    # 2. List consents
    list_res = await client.get("/v1/consents", headers=auth_headers_patient)
    assert list_res.status_code == 200
    consents = list_res.json()
    assert len(consents) >= 1
    assert any(c["id"] == consent_id for c in consents)

    # 3. Revoke consent
    revoke_res = await client.post(
        f"/v1/consents/{consent_id}/revoke",
        headers=auth_headers_patient,
    )
    assert revoke_res.status_code == 200
    revoked_data = revoke_res.json()
    assert revoked_data["revoked_at"] is not None


@pytest.mark.asyncio
async def test_consent_unauthorized(client: AsyncClient):
    res = await client.post(
        "/v1/consents",
        json={"purpose": "medical_report_ocr_simplification"},
    )
    assert res.status_code == 401
