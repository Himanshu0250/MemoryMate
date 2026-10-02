from datetime import datetime, timezone
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def format_notif_doc(doc: dict) -> NotificationResponse:
    return NotificationResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        type=doc.get("type", "ai_suggestion"),
        title=doc["title"],
        message=doc["message"],
        related_entity_type=doc.get("related_entity_type"),
        related_entity_id=str(doc.get("related_entity_id")) if doc.get("related_entity_id") else None,
        is_read=doc.get("is_read", False),
        created_at=doc.get("created_at", datetime.now(timezone.utc))
    )

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"user_id": current_user["_id"]}
    if unread_only:
        query["is_read"] = False

    cursor = db.notifications.find(query).sort("created_at", -1).limit(50)
    notifs = await cursor.to_list(length=50)
    return [format_notif_doc(n) for n in notifs]

@router.patch("/{id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    notif = await db.notifications.find_one({"_id": oid, "user_id": current_user["_id"]})
    if notif:
        await db.notifications.update_one({"_id": oid}, {"$set": {"is_read": True}})
        notif["is_read"] = True
        return format_notif_doc(notif)
    raise HTTPException(status_code=404, detail="Notification not found")

@router.post("/mark-all-read")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    await db.notifications.update_many({"user_id": current_user["_id"]}, {"$set": {"is_read": True}})
    return {"message": "All notifications marked as read"}
