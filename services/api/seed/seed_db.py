import asyncio
import uuid
import os
from datetime import datetime, timezone
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings
from app.core.database import Base
import app.models  # ensure models are registered
from app.models.user import User
from app.models.patient import Patient
from app.models.caregiver import CaregiverLink
from app.models.health_worker import HealthWorker
from app.models.consent import Consent
from app.models.audit_log import AuditLog


async def seed(db_url: str = None):
    target_url = db_url or settings.DATABASE_URL
    print(f"Connecting to database: {target_url.split('@')[-1] if '@' in target_url else target_url}")

    connect_args = {}
    if "sqlite" in target_url:
        connect_args["check_same_thread"] = False

    try:
        active_engine = create_async_engine(target_url, connect_args=connect_args)
        async with active_engine.begin() as conn:
            if "postgresql" in str(active_engine.url):
                try:
                    from sqlalchemy import text
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                except Exception as e:
                    print(f"pgvector extension notice: {e}")
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        if "postgresql" in target_url and not db_url:
            print(f"Warning: PostgreSQL is not reachable ({e}). Falling back to local SQLite 'sqlite+aiosqlite:///dev_health.db'...")
            target_url = "sqlite+aiosqlite:///dev_health.db"
            active_engine = create_async_engine(target_url, connect_args={"check_same_thread": False})
            async with active_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        else:
            raise

    session_maker = async_sessionmaker(bind=active_engine, class_=AsyncSession, expire_on_commit=False)

    async with session_maker() as session:
        # 1. Admin User
        admin_phone = "+919999999999"
        res = await session.execute(select(User).where(User.phone == admin_phone))
        admin = res.scalar_one_or_none()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                phone=admin_phone,
                role="admin",
                preferred_language="en",
            )
            session.add(admin)
            print(f"-> Created Admin user: {admin_phone}")

        # 2. Health Worker User
        hw_phone = "+919888888888"
        res = await session.execute(select(User).where(User.phone == hw_phone))
        hw_user = res.scalar_one_or_none()
        if not hw_user:
            hw_user = User(
                id=str(uuid.uuid4()),
                phone=hw_phone,
                role="health_worker",
                preferred_language="hi",
            )
            session.add(hw_user)
            await session.flush()

            hw_profile = HealthWorker(
                id=str(uuid.uuid4()),
                user_id=hw_user.id,
                region="Northern Region (Delhi/UP)",
                languages=["hi", "en", "pa", "ur"],
                is_available=True,
            )
            session.add(hw_profile)
            print(f"-> Created Health Worker: {hw_phone} (region: {hw_profile.region})")

        # 3. Caregiver User
        caregiver_phone = "+919777777777"
        res = await session.execute(select(User).where(User.phone == caregiver_phone))
        caregiver = res.scalar_one_or_none()
        if not caregiver:
            caregiver = User(
                id=str(uuid.uuid4()),
                phone=caregiver_phone,
                role="caregiver",
                preferred_language="te",
            )
            session.add(caregiver)
            print(f"-> Created Caregiver: {caregiver_phone}")

        await session.flush()

        # 4. Elderly Parent Patient (Feature Phone User)
        patient_phone = "+919666666666"
        res = await session.execute(select(Patient).where(Patient.phone_for_ivr == patient_phone))
        patient = res.scalar_one_or_none()
        if not patient:
            patient = Patient(
                id=str(uuid.uuid4()),
                user_id=None,  # Feature phone user without mobile app account
                display_name="Sita Ramulu (Father)",
                preferred_language="te",
                phone_for_ivr=patient_phone,
                phone_type="feature",
            )
            session.add(patient)
            await session.flush()

            link = CaregiverLink(
                id=str(uuid.uuid4()),
                caregiver_id=caregiver.id,
                patient_id=patient.id,
                status="active",
            )
            session.add(link)
            print(f"-> Created Patient ({patient.display_name}) linked to Caregiver ({caregiver_phone})")

        # 5. Consent Records
        consent_check = await session.execute(
            select(Consent).where(Consent.user_id == caregiver.id)
        )
        if not consent_check.scalar_one_or_none():
            consent = Consent(
                id=str(uuid.uuid4()),
                user_id=caregiver.id,
                purpose="medical_report_ocr_simplification_and_voice_assistance",
                granted_at=datetime.now(timezone.utc),
            )
            session.add(consent)
            print("-> Created DPDP Consent record for Caregiver")

        # 6. Audit Log
        audit = AuditLog(
            id=str(uuid.uuid4()),
            actor_id=admin.id if admin else None,
            action="SYSTEM_SEEDED",
            entity="System",
            entity_id="init",
            ip_address="127.0.0.1",
        )
        session.add(audit)

        # 7. Seed Curated Glossary (60 Medical Terms & Embeddings)
        from app.pipeline.glossary.seed import seed_glossary_terms
        glossary_count = await seed_glossary_terms(session)
        print(f"-> Seeded {glossary_count} Curated Medical Glossary Terms")

        await session.commit()
        print("[SUCCESS] Database seeding completed successfully!")
    await active_engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
