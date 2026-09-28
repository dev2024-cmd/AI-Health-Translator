from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.storage import get_storage_service

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint for container orchestrators, load balancers, and monitoring probes.
    """
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    storage_status = "healthy"
    try:
        storage = get_storage_service()
        if not storage:
            storage_status = "degraded"
    except Exception as e:
        storage_status = f"unhealthy: {str(e)}"

    is_healthy = db_status == "healthy" and storage_status == "healthy"

    return {
        "status": "ok" if is_healthy else "degraded",
        "service": "ai-health-report-translator-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "storage": storage_status,
        "mock_mode": settings.MOCK_PROVIDERS,
    }
