from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_id: Optional[str]
    action: str
    entity: str
    entity_id: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
