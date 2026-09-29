import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("database")

Base = declarative_base()

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./dev_health.db"


def normalize_database_url(raw_url: str) -> str:
    if not raw_url or not str(raw_url).strip():
        return SQLITE_FALLBACK_URL
    url = str(raw_url).strip()
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url


def create_engine_and_session(raw_url: str):
    url = normalize_database_url(raw_url)
    connect_args = {}
    if "sqlite" in url:
        connect_args["check_same_thread"] = False

    try:
        eng = create_async_engine(
            url,
            echo=False,
            future=True,
            connect_args=connect_args,
        )
        session_factory = async_sessionmaker(
            bind=eng,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        return eng, session_factory
    except Exception as err:
        logger.warning(f"Could not initialize database with URL '{url}': {err}. Falling back to SQLite.")
        fallback_eng = create_async_engine(
            SQLITE_FALLBACK_URL,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False},
        )
        session_factory = async_sessionmaker(
            bind=fallback_eng,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        return fallback_eng, session_factory


# Initialize primary engine
engine, AsyncSessionLocal = create_engine_and_session(settings.DATABASE_URL)


async def switch_to_sqlite():
    """Fallback to local SQLite if PostgreSQL is unreachable."""
    global engine, AsyncSessionLocal
    print(f"⚠️ PostgreSQL unreachable at {settings.DATABASE_URL}. Switching to local SQLite: {SQLITE_FALLBACK_URL}")
    engine, AsyncSessionLocal = create_engine_and_session(SQLITE_FALLBACK_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Local SQLite dev_health.db initialized successfully with all tables.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    global AsyncSessionLocal, engine
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as err:
            await session.rollback()
            err_str = str(err).lower()
            if "connect call failed" in err_str or "connection refused" in err_str:
                await switch_to_sqlite()
            raise
        finally:
            await session.close()
