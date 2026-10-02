from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.memory import MemoryCategory, MemoryImportance, MemoryMood

class MemoryExtractionRequest(BaseModel):
    raw_text: str = Field(..., min_length=3, description="Unstructured natural text to extract memory from")

class ExtractedMemoryResponse(BaseModel):
    title: str
    description: str
    date: Optional[datetime] = None
    person_name: Optional[str] = None
    person_id: Optional[str] = None
    category: MemoryCategory
    tags: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    importance: MemoryImportance
    mood: MemoryMood
    ai_gift_ideas: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    confidence_score: float = 0.95
    source_raw_text: str

class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    limit: int = 5

class RAGSearchResponse(BaseModel):
    query: str
    answer: str
    source_memories: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = 0.9

class ChatMessage(BaseModel):
    sender: str # user, assistant
    text: str
    source_memory_ids: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    source_memories: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)

class MemoryConnectionItem(BaseModel):
    title: str
    description: str
    memory_ids: List[str]
    person_name: Optional[str] = None
    actionable_insight: str
    confidence: float = 0.88

class MemoryConnectionsResponse(BaseModel):
    connections: List[MemoryConnectionItem]

class AIInsightsResponse(BaseModel):
    frequently_remembered_people: List[Dict[str, Any]]
    common_topics: List[Dict[str, Any]]
    upcoming_milestones: List[Dict[str, Any]]
    recent_interests: List[str]
    potential_gift_ideas: List[Dict[str, Any]]
    sentiment_distribution: Dict[str, int]
    generated_at: datetime
