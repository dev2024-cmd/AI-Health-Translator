import os
import pytest
from seed.seed_db import seed
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.user import User
from app.models.patient import Patient
from app.models.caregiver import CaregiverLink
from app.models.consent import Consent


@pytest.mark.asyncio
async def test_database_seed_execution():
    test_db_file = "test_seed.db"
    if os.path.exists(test_db_file):
        os.remove(test_db_file)

    test_db_url = f"sqlite+aiosqlite:///{test_db_file}"
    try:
        # Run seed
        await seed(db_url=test_db_url)

        engine = create_async_engine(test_db_url, connect_args={"check_same_thread": False})
        session_maker = async_sessionmaker(bind=engine, class_=AsyncSession)

        async with session_maker() as session:
            # Check Admin
            res_admin = await session.execute(select(User).where(User.role == "admin"))
            admin = res_admin.scalar_one_or_none()
            assert admin is not None
            assert admin.phone == "+919999999999"

            # Check Health Worker
            res_hw = await session.execute(select(User).where(User.role == "health_worker"))
            hw = res_hw.scalar_one_or_none()
            assert hw is not None

            # Check Patient & Caregiver link
            res_patient = await session.execute(select(Patient))
            patient = res_patient.scalar_one_or_none()
            assert patient is not None
            assert patient.display_name == "Sita Ramulu (Father)"

            res_link = await session.execute(select(CaregiverLink))
            link = res_link.scalar_one_or_none()
            assert link is not None
            assert link.patient_id == patient.id

            # Check Consent
            res_consent = await session.execute(select(Consent))
            consent = res_consent.scalar_one_or_none()
            assert consent is not None
            assert "medical_report" in consent.purpose

        await engine.dispose()
    finally:
        if os.path.exists(test_db_file):
            try:
                os.remove(test_db_file)
            except Exception:
                pass
