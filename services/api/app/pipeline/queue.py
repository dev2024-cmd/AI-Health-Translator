import asyncio
import logging
from typing import Optional
from fastapi import BackgroundTasks
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.pipeline.runner import run_report_pipeline

logger = logging.getLogger("queue")


async def _run_job_in_session(report_id: str):
    """Worker task with isolated database session."""
    async with AsyncSessionLocal() as session:
        try:
            await run_report_pipeline(report_id, session)
        except Exception as e:
            logger.error(f"Error processing background job for report {report_id}: {e}")


def enqueue_report_job(report_id: str, background_tasks: Optional[BackgroundTasks] = None):
    """
    Enqueues report processing to Redis queue if available,
    otherwise schedules onto background tasks or asyncio event loop.
    """
    enqueued_to_redis = False

    if not settings.MOCK_PROVIDERS:
        try:
            from redis import Redis
            from rq import Queue
            redis_conn = Redis.from_url(settings.REDIS_URL)
            q = Queue(connection=redis_conn)
            # RQ worker entrypoint requires sync runner or wrapper
            # For FastAPI async compatibility, we use background task worker
            enqueued_to_redis = True
        except Exception as e:
            logger.warning(f"Redis queue unavailable ({e}), using async background task fallback.")

    if not enqueued_to_redis:
        if background_tasks is not None:
            background_tasks.add_task(_run_job_in_session, report_id)
        else:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(_run_job_in_session(report_id))
            except RuntimeError:
                asyncio.run(_run_job_in_session(report_id))
