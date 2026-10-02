from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.schemas.ai import (
    ExtractedMemoryResponse,
    RAGSearchResponse,
    ChatResponse,
    MemoryConnectionsResponse
)
from app.schemas.gift import GiftRecommendationResponse

class BaseAIService(ABC):
    @abstractmethod
    async def extract_memory(self, raw_text: str) -> ExtractedMemoryResponse:
        """Extract structured memory components from raw unstructured text."""
        pass

    @abstractmethod
    async def rag_search(self, query: str, memories: List[Dict[str, Any]]) -> RAGSearchResponse:
        """Perform grounded semantic search on memories with source citations."""
        pass

    @abstractmethod
    async def chat_response(
        self,
        message: str,
        history: List[Dict[str, Any]],
        memories: List[Dict[str, Any]],
        conversation_id: str,
        people: Optional[List[Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None
    ) -> ChatResponse:
        """Provide a conversational assistant response strictly grounded on stored memories, people, and events."""
        pass

    @abstractmethod
    async def recommend_gifts(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> GiftRecommendationResponse:
        """Generate tailored gift ideas based on memories and preferences."""
        pass

    @abstractmethod
    async def find_connections(
        self,
        memories: List[Dict[str, Any]],
        events: List[Dict[str, Any]]
    ) -> MemoryConnectionsResponse:
        """Discover latent links and synergies across memories and upcoming events."""
        pass

    @abstractmethod
    async def generate_person_summary(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> str:
        """Generate a concise, warm biographical summary for a person."""
        pass
