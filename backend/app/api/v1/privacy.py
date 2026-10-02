from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter(prefix="/privacy", tags=["Privacy & Data Sovereignty"])

@router.get("/export")
async def export_all_user_data(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exports 100% of user data in machine-readable JSON format for full GDPR compliance
    and data ownership portability.
    """
    uid = current_user["_id"]

    # Fetch all collections for this user
    user_info = {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "created_at": str(current_user.get("created_at")),
        "theme_preference": current_user.get("theme_preference", "system"),
        "ai_settings": current_user.get("ai_settings", {})
    }

    memories_cursor = db.memories.find({"user_id": uid})
    memories = await memories_cursor.to_list(length=1000)
    for m in memories:
        m["_id"] = str(m["_id"])
        m["user_id"] = str(m["user_id"])
        if m.get("date"):
            m["date"] = str(m["date"])
        if m.get("created_at"):
            m["created_at"] = str(m["created_at"])
        if m.get("updated_at"):
            m["updated_at"] = str(m["updated_at"])

    people_cursor = db.people.find({"user_id": uid})
    people = await people_cursor.to_list(length=1000)
    for p in people:
        p["_id"] = str(p["_id"])
        p["user_id"] = str(p["user_id"])
        if p.get("created_at"):
            p["created_at"] = str(p["created_at"])
        if p.get("updated_at"):
            p["updated_at"] = str(p["updated_at"])

    events_cursor = db.events.find({"user_id": uid})
    events = await events_cursor.to_list(length=1000)
    for e in events:
        e["_id"] = str(e["_id"])
        e["user_id"] = str(e["user_id"])
        if e.get("date"):
            e["date"] = str(e["date"])
        if e.get("created_at"):
            e["created_at"] = str(e["created_at"])

    gifts_cursor = db.gift_ideas.find({"user_id": uid})
    gifts = await gifts_cursor.to_list(length=1000)
    for g in gifts:
        g["_id"] = str(g["_id"])
        g["user_id"] = str(g["user_id"])
        if g.get("created_at"):
            g["created_at"] = str(g["created_at"])
        if g.get("purchased_date"):
            g["purchased_date"] = str(g["purchased_date"])

    export_payload = {
        "app": "MemoryMate",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": user_info,
        "people": people,
        "memories": memories,
        "events": events,
        "gift_ideas": gifts,
        "total_records": len(people) + len(memories) + len(events) + len(gifts)
    }

    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": f"attachment; filename=memorymate_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"}
    )

@router.delete("/wipe", status_code=status.HTTP_200_OK)
async def wipe_user_data(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Permanently erases all memories, people, events, gifts, and chats for the current user.
    """
    uid = current_user["_id"]
    await db.memories.delete_many({"user_id": uid})
    await db.people.delete_many({"user_id": uid})
    await db.events.delete_many({"user_id": uid})
    await db.gift_ideas.delete_many({"user_id": uid})
    await db.notifications.delete_many({"user_id": uid})
    await db.conversations.delete_many({"user_id": uid})

    return {"message": "All personal memories, people profiles, and records have been completely wiped."}
