from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # ensure all models are imported
from app.api.v1.router import v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup: create tables if running in development / test with non-PostgreSQL (e.g. SQLite)
    # or for fast initial setup before migrations run
    try:
        async with engine.begin() as conn:
            # Enable pgvector if on PostgreSQL
            if "postgresql" in settings.DATABASE_URL:
                try:
                    from sqlalchemy import text
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                except Exception:
                    pass
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Warning during table initialization: {e}")
    yield
    # Teardown
    await engine.dispose()


app = FastAPI(
    title="AI Health Report Translator API",
    description="Multilingual Medical Report Simplification and Voice Assistance API for Indian Languages",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/v1/openapi.json",
    lifespan=lifespan,
)

# CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(v1_router)


@app.get("/")
async def root():
    return {
        "message": "AI Health Report Translator API is online",
        "docs": "/docs",
        "health": "/v1/health",
        "version": "1.0.0",
    }
