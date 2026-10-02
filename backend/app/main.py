import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1 import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("memorymate")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing MemoryMate Backend Services...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down MemoryMate Backend Services...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MemoryMate: Private AI-powered memory assistant for Hacktoberfest 2026 'Build for a Friend' challenge.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.AI_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
