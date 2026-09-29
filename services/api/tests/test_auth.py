import pytest
from httpx import AsyncClient
from app.api.v1 import auth
from app.core.config import settings
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
async def test_live_twilio_otp_flow_does_not_return_code(client: AsyncClient, monkeypatch):
    sent_to = []

    async def fake_send_code(self, phone: str):
        sent_to.append(phone)

    async def fake_check_code(self, phone: str, code: str):
        return phone == "+919812345670" and code == "654321"

    monkeypatch.setattr(auth.settings, "OTP_DEV_MODE", False)
    monkeypatch.setattr(auth.settings, "OTP_PROVIDER", "twilio_verify")
    monkeypatch.setattr(auth.TwilioVerifyProvider, "send_code", fake_send_code)
    monkeypatch.setattr(auth.TwilioVerifyProvider, "check_code", fake_check_code)

    request = await client.post("/v1/auth/otp/request", json={"phone": "9812345670"})
    assert request.status_code == 200
    assert request.json()["dev_otp"] is None
    assert sent_to == ["+919812345670"]

    verification = await client.post(
        "/v1/auth/otp/verify",
        json={"phone": "9812345670", "code": "654321"},
    )
    assert verification.status_code == 200


@pytest.mark.asyncio
async def test_only_configured_phone_can_bootstrap_admin(client: AsyncClient, monkeypatch):
    phone = "9812345671"
    monkeypatch.setattr(settings, "BOOTSTRAP_ADMIN_PHONE", "+919812345671")

    requested = await client.post("/v1/auth/otp/request", json={"phone": phone})
    verified = await client.post(
        "/v1/auth/otp/verify",
        json={"phone": phone, "code": requested.json()["dev_otp"], "role": "admin"},
    )

    assert verified.status_code == 200
    assert verified.json()["user"]["role"] == "admin"


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
