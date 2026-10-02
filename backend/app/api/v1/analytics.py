from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.analytics import AnalyticsOverviewResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    uid = current_user["_id"]

    total_memories = await db.memories.count_documents({"user_id": uid})
    total_people = await db.people.count_documents({"user_id": uid})
    total_events = await db.events.count_documents({"user_id": uid})
    total_gift_ideas = await db.gift_ideas.count_documents({"user_id": uid})
    total_favorites = await db.memories.count_documents({"user_id": uid, "is_favorite": True})

    # Fetch memories for aggregations
    cursor = db.memories.find({"user_id": uid})
    memories = await cursor.to_list(length=300)

    category_counts = {}
    person_counts = {}
    importance_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    mood_counts = {"happy": 0, "excited": 0, "reflective": 0, "loving": 0, "grateful": 0, "touched": 0, "neutral": 0}
    tag_counts = {}
    month_counts = {}

    for m in memories:
        # Category
        cat = m.get("category", "Other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Person
        p_name = m.get("person_name") or "Personal"
        person_counts[p_name] = person_counts.get(p_name, 0) + 1

        # Importance
        imp = m.get("importance", "medium")
        if imp in importance_counts:
            importance_counts[imp] += 1
        else:
            importance_counts["medium"] += 1

        # Mood
        mood = m.get("mood", "happy")
        if mood in mood_counts:
            mood_counts[mood] += 1
        else:
            mood_counts["happy"] += 1

        # Tags
        for t in m.get("tags", []):
            tag_counts[t] = tag_counts.get(t, 0) + 1

        # Over time (group by YYYY-MM)
        d = m.get("date") or m.get("created_at") or datetime.now(timezone.utc)
        if isinstance(d, datetime):
            m_key = d.strftime("%b %Y")
        else:
            m_key = str(d)[:7]
        month_counts[m_key] = month_counts.get(m_key, 0) + 1

    formatted_categories = [{"category": k, "count": v} for k, v in category_counts.items()]
    formatted_people = [{"person_name": k, "count": v} for k, v in sorted(person_counts.items(), key=lambda x: x[1], reverse=True)[:8]]
    formatted_tags = [{"tag": k, "count": v} for k, v in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:15]]
    formatted_time = [{"period": k, "count": v} for k, v in month_counts.items()]

    return AnalyticsOverviewResponse(
        total_memories=total_memories,
        total_people=total_people,
        total_events=total_events,
        total_gift_ideas=total_gift_ideas,
        total_favorites=total_favorites,
        memories_by_category=formatted_categories,
        memories_by_person=formatted_people,
        memories_by_importance=importance_counts,
        memories_by_mood=mood_counts,
        memories_over_time=formatted_time,
        top_tags=formatted_tags,
        activity_streak_days=max(1, len(memories) // 2)
    )
