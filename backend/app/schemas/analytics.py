from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class AnalyticsOverviewResponse(BaseModel):
    total_memories: int
    total_people: int
    total_events: int
    total_gift_ideas: int
    total_favorites: int
    memories_by_category: List[Dict[str, Any]]
    memories_by_person: List[Dict[str, Any]]
    memories_by_importance: Dict[str, int]
    memories_by_mood: Dict[str, int]
    memories_over_time: List[Dict[str, Any]]
    top_tags: List[Dict[str, Any]]
    activity_streak_days: int
