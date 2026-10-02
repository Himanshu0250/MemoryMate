from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MemoryMate"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "memorymate-super-secret-production-key-change-in-env-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "memorymate"
    
    # AI Engine Settings
    AI_PROVIDER: str = "gemma"  # gemma, ollama, groq, huggingface, fallback
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"
    
    # Open-weight Cloud API (Groq / Hugging Face / OpenRouter / vLLM fallback)
    OPENWEIGHT_API_KEY: str = ""
    OPENWEIGHT_BASE_URL: str = "https://api.groq.com/openai/v1"
    OPENWEIGHT_MODEL: str = "gemma2-9b-it"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
