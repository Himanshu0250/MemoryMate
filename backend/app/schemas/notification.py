from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str # birthday_reminder, event_reminder, ai_suggestion, connection_found, memory_of_the_day
    title: str
    message: str
    related_entity_type: Optional[str] = None # person, memory, event, gift
    related_entity_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
