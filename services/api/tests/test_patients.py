import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_caregiver_create_and_link_patient(
    client: AsyncClient,
    auth_headers_caregiver: dict,
):
    # Caregiver creates elderly parent profile
    res = await client.post(
        "/v1/patients",
        json={
            "display_name": "Ramesh Patel (Grandfather)",
            "preferred_language": "gu",
            "phone_for_ivr": "+919876500000",
            "phone_type": "feature",
        },
        headers=auth_headers_caregiver,
    )
    assert res.status_code == 201
    patient_data = res.json()
    assert patient_data["display_name"] == "Ramesh Patel (Grandfather)"
    assert patient_data["preferred_language"] == "gu"
    assert patient_data["phone_type"] == "feature"
    patient_id = patient_data["id"]

    # Caregiver lists their linked patients
    list_res = await client.get("/v1/patients", headers=auth_headers_caregiver)
    assert list_res.status_code == 200
    patients = list_res.json()
    assert any(p["id"] == patient_id for p in patients)


@pytest.mark.asyncio
async def test_health_worker_view_all_patients(
    client: AsyncClient,
    auth_headers_health_worker: dict,
):
    res = await client.get("/v1/patients", headers=auth_headers_health_worker)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
