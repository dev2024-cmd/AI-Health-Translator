import pytest
from httpx import AsyncClient
from app.core.security import sanitize_phone, mask_phone


@pytest.mark.asyncio
async def test_phone_sanitization_and_masking():
    # 10 digits
    assert sanitize_phone("9876543210") == "+919876543210"
    # With dashes/spaces
    assert sanitize_phone("+91 98765-43210") == "+919876543210"
    # Masking for DPDP compliance
    masked = mask_phone("+919876543210")
    assert masked.startswith("+9198")
    assert masked.endswith("210")
    assert "****" in masked
    assert "7654" not in masked


@pytest.mark.asyncio
async def test_otp_request_flow(client: AsyncClient):
    response = await client.post(
        "/v1/auth/otp/request",
        json={"phone": "9876543210"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "OTP sent successfully"
    assert "phone_masked" in data
    assert data["dev_otp"] == "123456"  # in dev mode


@pytest.mark.asyncio
async def test_otp_request_invalid_phone(client: AsyncClient):
    response = await client.post(
        "/v1/auth/otp/request",
        json={"phone": "123"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_otp_verify_success(client: AsyncClient):
    phone = "9812345678"
    # 1. Request OTP
    req_res = await client.post("/v1/auth/otp/request", json={"phone": phone})
    assert req_res.status_code == 200
    otp = req_res.json()["dev_otp"]

    # 2. Verify OTP
    verify_res = await client.post(
        "/v1/auth/otp/verify",
        json={
            "phone": phone,
            "code": otp,
            "role": "patient",
            "preferred_language": "hi",
        },
    )
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["role"] == "patient"
    assert token_data["user"]["preferred_language"] == "hi"

    # 3. Access protected /me
    access_token = token_data["access_token"]
    me_res = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["phone"] == "+91" + phone


@pytest.mark.asyncio
async def test_otp_verify_invalid_code(client: AsyncClient):
    phone = "9812345679"
    await client.post("/v1/auth/otp/request", json={"phone": phone})

    response = await client.post(
        "/v1/auth/otp/verify",
        json={"phone": phone, "code": "000000"},
    )
    assert response.status_code == 400
    assert "Invalid or expired" in response.json()["detail"]


@pytest.mark.asyncio
async def test_token_refresh(client: AsyncClient):
    phone = "9812345680"
    await client.post("/v1/auth/otp/request", json={"phone": phone})
    verify_res = await client.post(
        "/v1/auth/otp/verify",
        json={"phone": phone, "code": "123456", "role": "caregiver"},
    )
    refresh_token = verify_res.json()["refresh_token"]

    refresh_res = await client.post(
        "/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    response = await client.get("/v1/auth/me")
    assert response.status_code == 401
