from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.memories import router as memories_router
from app.api.v1.people import router as people_router
from app.api.v1.events import router as events_router
from app.api.v1.ai import router as ai_router
from app.api.v1.gifts import router as gifts_router
from app.api.v1.voice import router as voice_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.privacy import router as privacy_router
from app.api.v1.seed import router as seed_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(memories_router)
api_router.include_router(people_router)
api_router.include_router(events_router)
api_router.include_router(ai_router)
api_router.include_router(gifts_router)
api_router.include_router(voice_router)
api_router.include_router(analytics_router)
api_router.include_router(notifications_router)
api_router.include_router(privacy_router)
api_router.include_router(seed_router)
