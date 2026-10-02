from app.core.config import settings
from app.ai.base import BaseAIService
from app.ai.gemma_provider import GemmaAIService
from app.ai.fallback_provider import FallbackAIService

_ai_service_instance: BaseAIService = None

def get_ai_service() -> BaseAIService:
    global _ai_service_instance
    if _ai_service_instance is None:
        if settings.AI_PROVIDER.lower() in ["gemma", "ollama", "groq", "huggingface"]:
            _ai_service_instance = GemmaAIService()
        else:
            _ai_service_instance = FallbackAIService()
    return _ai_service_instance
