import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

# Ensure environment variables are set before any app imports
os.environ["ENVIRONMENT"] = "test"
os.environ["MOCK_PROVIDERS"] = "true"
os.environ["OTP_DEV_MODE"] = "true"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_1234567890_test_env"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.main import app as fastapi_app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.storage import set_storage_service, LocalStorageService
import app.models  # registers models

# In-memory SQLite for fast, isolated, deterministic unit tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Ensure app modules and background queue use TestingSessionLocal
import app.core.database as db_mod
db_mod.engine = test_engine
db_mod.AsyncSessionLocal = TestingSessionLocal


@pytest_asyncio.fixture(scope="session", autouse=True, loop_scope="session")
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def reset_storage_state():
    """Reset storage to a clean instance for every test."""
    set_storage_service(LocalStorageService())
    yield


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Creates an HTTPX AsyncClient configured with an ASGITransport and isolated session generator.
    Each incoming HTTP request receives an independent database session.
    """
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestingSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    fastapi_app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def auth_headers_patient():
    token = create_access_token({
        "sub": "test-patient-user-id",
        "phone": "+919876543210",
        "role": "patient",
        "lang": "hi",
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_caregiver():
    token = create_access_token({
        "sub": "test-caregiver-user-id",
        "phone": "+919876543211",
        "role": "caregiver",
        "lang": "te",
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_health_worker():
    token = create_access_token({
        "sub": "test-hw-user-id",
        "phone": "+919876543212",
        "role": "health_worker",
        "lang": "en",
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_admin():
    token = create_access_token({
        "sub": "test-admin-user-id",
        "phone": "+919876543213",
        "role": "admin",
        "lang": "en",
    })
    return {"Authorization": f"Bearer {token}"}
