from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum

class MemoryCategory(str, Enum):
    FRIENDSHIP = "Friendship"
    FAMILY = "Family"
    BIRTHDAY = "Birthday"
    GIFT = "Gift"
    FOOD = "Food"
    TRAVEL = "Travel"
    HOBBY = "Hobby"
    CONVERSATION = "Conversation"
    STUDY = "Study"
    WORK = "Work"
    IMPORTANT = "Important"
    OTHER = "Other"

class MemoryImportance(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class MemoryMood(str, Enum):
    HAPPY = "happy"
    NEUTRAL = "neutral"
    REFLECTIVE = "reflective"
    EXCITED = "excited"
    TOUCHED = "touched"
    GRATEFUL = "grateful"
    LOVING = "loving"

class MemoryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    date: datetime = Field(default_factory=datetime.utcnow)
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    category: MemoryCategory = MemoryCategory.CONVERSATION
    tags: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    importance: MemoryImportance = MemoryImportance.MEDIUM
    mood: MemoryMood = MemoryMood.HAPPY
    image_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    is_favorite: bool = False
    ai_gift_ideas: List[str] = Field(default_factory=list)
    source_raw_text: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    category: Optional[MemoryCategory] = None
    tags: Optional[List[str]] = None
    location: Optional[str] = None
    importance: Optional[MemoryImportance] = None
    mood: Optional[MemoryMood] = None
    image_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    is_favorite: Optional[bool] = None
    ai_gift_ideas: Optional[List[str]] = None

class MemoryResponse(MemoryBase):
    id: str
    user_id: str
    extracted_by_ai: bool = False
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MemoryListResponse(BaseModel):
    items: List[MemoryResponse]
    total: int
    page: int
    limit: int
