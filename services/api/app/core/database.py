import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("database")

Base = declarative_base()

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./dev_health.db"


def create_engine_and_session(url: str):
    connect_args = {}
    if "sqlite" in url:
        connect_args["check_same_thread"] = False

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
