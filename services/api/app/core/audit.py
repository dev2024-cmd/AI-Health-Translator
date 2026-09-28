import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog


async def log_audit_event(
    session: AsyncSession,
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """
    DPDP Act 2023 Audit Logger.
    Persists an immutable record of data access, consent updates, or patient operations.
    Never logs raw medical report text or plain phone numbers.
    """
    entry = AuditLog(
        id=str(uuid.uuid4()),
        actor_id=actor_id,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id else None,
        ip_address=ip_address or "127.0.0.1",
    )
    session.add(entry)
    await session.flush()
    return entry
