import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.audit import log_audit_event
from app.models.audit_log import AuditLog


@pytest.mark.asyncio
async def test_audit_event_logging(db_session: AsyncSession):
    event = await log_audit_event(
        session=db_session,
        action="REPORT_VIEWED",
        entity="Report",
        entity_id="test-report-123",
        actor_id="test-user-456",
        ip_address="192.168.1.1",
    )
    assert event.id is not None
    assert event.action == "REPORT_VIEWED"
    assert event.entity == "Report"
    assert event.entity_id == "test-report-123"

    # Query from DB
    res = await db_session.execute(
        select(AuditLog).where(AuditLog.id == event.id)
    )
    saved = res.scalar_one_or_none()
    assert saved is not None
    assert saved.action == "REPORT_VIEWED"
