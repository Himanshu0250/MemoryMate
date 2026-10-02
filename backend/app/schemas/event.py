from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    BIRTHDAY = "birthday"
    ANNIVERSARY = "anniversary"
    TRIP = "trip"
    APPOINTMENT = "appointment"
    PROMISE = "promise"
    IMPORTANT_DATE = "important_date"

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: EventType = EventType.BIRTHDAY
    date: datetime
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    recurring: bool = False
    recurrence_pattern: Optional[str] = "yearly" # yearly, monthly, none
    reminder_days_before: List[int] = Field(default_factory=lambda: [7, 1, 0])
    notes: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[EventType] = None
    date: Optional[datetime] = None
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    reminder_days_before: Optional[List[int]] = None
    notes: Optional[str] = None

class EventResponse(EventBase):
    id: str
    user_id: str
    days_until: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
