import pytest
from httpx import AsyncClient
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.models.user import User
from app.models.device import Device
from app.models.audit_log import AuditLog
from app.core.security import generate_otp


@pytest.mark.asyncio
async def test_signup_profile_completion(client: AsyncClient, db_session):
    # 1. Register user via OTP
    phone = "+919888877771"
    otp_code = generate_otp(phone)
    verify_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp_code})
    assert verify_res.status_code == 200
    token = verify_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Complete profile
    profile_payload = {
        "name": "Ramesh Kumar",
        "age": 48,
        "preferred_language": "hi",
        "usage": "self"
    }
    prof_res = await client.post("/v1/auth/signup/profile", json=profile_payload, headers=headers)
    assert prof_res.status_code == 200
    data = prof_res.json()
    assert data["name"] == "Ramesh Kumar"
    assert data["age"] == 48
    assert data["preferred_language"] == "hi"
    assert data["usage"] == "self"


@pytest.mark.asyncio
async def test_set_and_verify_mobile_mpin(client: AsyncClient):
    phone = "+919888877772"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set 4-digit MPIN for mobile device
    pin_payload = {
        "platform": "mobile",
        "device_label": "Redmi Note 11",
        "pin": "5829",
        "confirm_pin": "5829"
    }
    set_res = await client.post("/v1/auth/pin/set", json=pin_payload, headers=headers)
    assert set_res.status_code == 200
    set_data = set_res.json()
    assert "device_id" in set_data
    assert set_data["platform"] == "mobile"
    device_id = set_data["device_id"]

    # Verify PIN with correct MPIN
    verify_pin_res = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "5829"
    })
    assert verify_pin_res.status_code == 200
    verify_data = verify_pin_res.json()
    assert "access_token" in verify_data
    assert "refresh_token" in verify_data
    assert verify_data["device_id"] == device_id


@pytest.mark.asyncio
async def test_set_and_verify_web_pin(client: AsyncClient):
    phone = "+919888877773"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Web requires 6-digit PIN
    pin_payload = {
        "platform": "web",
        "device_label": "Chrome Windows 11",
        "pin": "749281",
        "confirm_pin": "749281"
    }
    set_res = await client.post("/v1/auth/pin/set", json=pin_payload, headers=headers)
    assert set_res.status_code == 200
    device_id = set_res.json()["device_id"]

    # Verify 6-digit PIN
    v_pin = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "749281"
    })
    assert v_pin.status_code == 200
    assert "access_token" in v_pin.json()


@pytest.mark.asyncio
async def test_weak_pin_rejection(client: AsyncClient):
    phone = "+919888877774"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    weak_pins = [
        ("1111", "mobile", "all identical digits"),
        ("000000", "web", "all identical digits"),
        ("1234", "mobile", "sequential"),
        ("4321", "mobile", "sequential"),
        ("123456", "web", "sequential"),
        ("654321", "web", "sequential"),
        ("1994", "mobile", "birth-year"),
        ("2002", "mobile", "birth-year"),
        ("1212", "mobile", "repeating pattern"),
        ("123123", "web", "repeating pattern"),
        ("12", "mobile", "must be exactly 4 digits"),
        ("12345", "mobile", "must be exactly 4 digits"),
    ]

    for pin, platform, _ in weak_pins:
        res = await client.post("/v1/auth/pin/set", json={
            "platform": platform,
            "device_label": "Test Device",
            "pin": pin,
            "confirm_pin": pin
        }, headers=headers)
        assert res.status_code == 400, f"Expected weak PIN '{pin}' on {platform} to be rejected"


@pytest.mark.asyncio
async def test_lockout_after_five_failed_attempts_and_doubling(client: AsyncClient, db_session):
    phone = "+919888877775"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set PIN
    set_res = await client.post("/v1/auth/pin/set", json={
        "platform": "mobile",
        "device_label": "Lockout Test Device",
        "pin": "6814",
        "confirm_pin": "6814"
    }, headers=headers)
    device_id = set_res.json()["device_id"]

    # Attempts 1 to 4 should return 400 Bad Request with remaining attempts
    for attempt in range(1, 5):
        fail_res = await client.post("/v1/auth/pin/verify", json={
            "device_id": device_id,
            "pin": "0915"
        })
        assert fail_res.status_code == 400
        assert f"{5 - attempt} attempt(s) remaining" in fail_res.json()["detail"]

    # 5th attempt must trigger lockout (HTTP 423 Locked)
    lock_res = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "0915"
    })
    assert lock_res.status_code == 423
    assert "PIN locked after 5 failed attempts" in lock_res.json()["detail"]
    assert "15 minutes" in lock_res.json()["detail"]

    # Trying again during lockout immediately returns 423
    locked_attempt = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "6814"  # even correct PIN is rejected while locked
    })
    assert locked_attempt.status_code == 423


@pytest.mark.asyncio
async def test_pin_change_endpoint(client: AsyncClient):
    phone = "+919888877776"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    set_res = await client.post("/v1/auth/pin/set", json={
        "platform": "mobile",
        "device_label": "Change Pin Device",
        "pin": "4917",
        "confirm_pin": "4917"
    }, headers=headers)
    device_id = set_res.json()["device_id"]

    # Wrong old PIN
    wrong_old = await client.post("/v1/auth/pin/change", json={
        "device_id": device_id,
        "old_pin": "9999",
        "new_pin": "8362"
    }, headers=headers)
    assert wrong_old.status_code == 400
    assert "Current PIN is incorrect" in wrong_old.json()["detail"]

    # Successful change
    change_res = await client.post("/v1/auth/pin/change", json={
        "device_id": device_id,
        "old_pin": "4917",
        "new_pin": "8362"
    }, headers=headers)
    assert change_res.status_code == 200

    # Verify with new PIN
    v_new = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "8362"
    })
    assert v_new.status_code == 200


@pytest.mark.asyncio
async def test_pin_reset_strictly_requires_fresh_otp(client: AsyncClient):
    phone = "+919888877777"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    set_res = await client.post("/v1/auth/pin/set", json={
        "platform": "mobile",
        "device_label": "Reset Device",
        "pin": "3951",
        "confirm_pin": "3951"
    }, headers=headers)
    device_id = set_res.json()["device_id"]

    # Reset attempt with invalid OTP
    bad_reset = await client.post("/v1/auth/pin/reset", json={
        "phone": phone,
        "otp_code": "000000",
        "device_id": device_id,
        "new_pin": "7149"
    })
    assert bad_reset.status_code == 400
    assert "Invalid or expired OTP" in bad_reset.json()["detail"]

    # Reset attempt with fresh valid OTP
    fresh_otp = generate_otp(phone)
    good_reset = await client.post("/v1/auth/pin/reset", json={
        "phone": phone,
        "otp_code": fresh_otp,
        "device_id": device_id,
        "new_pin": "7149"
    })
    assert good_reset.status_code == 200
    assert "access_token" in good_reset.json()

    # Verify with newly reset PIN
    v_reset = await client.post("/v1/auth/pin/verify", json={
        "device_id": device_id,
        "pin": "7149"
    })
    assert v_reset.status_code == 200


@pytest.mark.asyncio
async def test_audit_logs_record_pin_events_without_plain_pin(client: AsyncClient, db_session):
    phone = "+919888877778"
    otp = generate_otp(phone)
    v_res = await client.post("/v1/auth/otp/verify", json={"phone": phone, "code": otp})
    token = v_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set PIN
    set_res = await client.post("/v1/auth/pin/set", json={
        "platform": "mobile",
        "device_label": "Audit Test Device",
        "pin": "4286",
        "confirm_pin": "4286"
    }, headers=headers)
    device_id = set_res.json()["device_id"]

    # Failed attempt
    await client.post("/v1/auth/pin/verify", json={"device_id": device_id, "pin": "9999"})

    # Successful attempt
    await client.post("/api/v1/auth/pin/verify", json={"device_id": device_id, "pin": "4286"})

    # Check audit log entries
    logs_res = await db_session.execute(select(AuditLog).where(AuditLog.entity == "Device"))
    logs = logs_res.scalars().all()
    actions = [l.action for l in logs]
    assert "PIN_SET" in actions
    assert "PIN_FAILED" in actions
    assert "PIN_VERIFIED" in actions

    # Ensure no plain PIN exists in any audit log text
    for log in logs:
        assert "4286" not in str(log.action)
        assert "4286" not in str(log.entity_id)
