from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class GiftBase(BaseModel):
    gift_name: str = Field(..., min_length=1, max_length=200)
    person_id: Optional[str] = None
    person_name: str
    reason: str
    source_memory_ids: List[str] = Field(default_factory=list)
    estimated_price: Optional[str] = None
    is_purchased: bool = False
    purchased_date: Optional[datetime] = None
    saved_by_user: bool = True

class GiftCreate(GiftBase):
    pass

class GiftUpdate(BaseModel):
    gift_name: Optional[str] = None
    reason: Optional[str] = None
    estimated_price: Optional[str] = None
    is_purchased: Optional[bool] = None
    purchased_date: Optional[datetime] = None
    saved_by_user: Optional[bool] = None

class GiftResponse(GiftBase):
    id: str
    user_id: str
    source_memories: List[Any] = Field(default_factory=list)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GiftRecommendationRequest(BaseModel):
    person_id: str
    budget_range: Optional[str] = None
    occasion: Optional[str] = None

class GiftSuggestion(BaseModel):
    gift_name: str
    reason: str
    source_memory_ids: List[str] = Field(default_factory=list)
    source_snippets: List[str] = Field(default_factory=list)
    estimated_price: Optional[str] = "$20 - $50"
    match_score: float = 0.95

class GiftRecommendationResponse(BaseModel):
    person_id: str
    person_name: str
    suggestions: List[GiftSuggestion]
