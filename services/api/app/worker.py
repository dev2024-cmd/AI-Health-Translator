import asyncio
import time
import logging
from redis import Redis
from rq import Worker, Queue, Connection
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")


def start_worker():
    logger.info(f"Connecting to Redis at {settings.REDIS_URL}...")
    try:
        redis_conn = Redis.from_url(settings.REDIS_URL)
        with Connection(redis_conn):
            qs = [Queue("default")]
            worker = Worker(qs)
            logger.info("Worker started listening on 'default' queue...")
            worker.work()
    except Exception as e:
        logger.error(f"Redis connection failed: {e}. Worker entering idle standby.")
        while True:
            time.sleep(10)


if __name__ == "__main__":
    start_worker()
