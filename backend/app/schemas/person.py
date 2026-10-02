from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class PersonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    relationship: Optional[str] = "Friend" # Friend, Best Friend, Family, Colleague, Partner, Mentor, Other
    avatar_url: Optional[str] = None
    birthday: Optional[str] = None # YYYY-MM-DD
    interests: List[str] = Field(default_factory=list)
    favorite_things: Dict[str, Any] = Field(default_factory=dict) # e.g. {"food": "Dark Chocolate", "color": "Blue"}
    notes: Optional[str] = None
    ai_summary: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    avatar_url: Optional[str] = None
    birthday: Optional[str] = None
    interests: Optional[List[str]] = None
    favorite_things: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    ai_summary: Optional[str] = None

class PersonResponse(PersonBase):
    id: str
    user_id: str
    memory_count: int = 0
    gift_count: int = 0
    upcoming_event: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PersonDetailResponse(PersonResponse):
    memories: List[Any] = Field(default_factory=list)
    gift_ideas: List[Any] = Field(default_factory=list)
    events: List[Any] = Field(default_factory=list)
