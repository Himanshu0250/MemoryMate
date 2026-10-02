from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventType
from app.api.deps import get_current_user

router = APIRouter(prefix="/events", tags=["Events & Reminders"])

def format_event_doc(doc: dict) -> EventResponse:
    event_date = doc["date"]
    if isinstance(event_date, str):
        event_date = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
    
    # Calculate days until event
    now = datetime.now(timezone.utc)
    # Normalize event_date to have timezone info if naive
    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=timezone.utc)
        
    diff = (event_date - now).days
    days_until = diff if diff >= 0 else 0

    return EventResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        person_id=str(doc["person_id"]) if doc.get("person_id") else None,
        person_name=doc.get("person_name"),
        title=doc["title"],
        type=doc.get("type", EventType.BIRTHDAY),
        date=event_date,
        recurring=doc.get("recurring", False),
        recurrence_pattern=doc.get("recurrence_pattern", "yearly"),
        reminder_days_before=doc.get("reminder_days_before", [7, 1, 0]),
        notes=doc.get("notes"),
        days_until=days_until,
        created_at=doc.get("created_at", now)
    )

@router.get("", response_model=List[EventResponse])
async def list_events(
    person_id: Optional[str] = None,
    type: Optional[str] = None,
    upcoming_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"user_id": current_user["_id"]}
    if person_id:
        query["person_id"] = person_id
    if type and type != "all":
        query["type"] = type
    if upcoming_only:
        query["date"] = {"$gte": datetime.now(timezone.utc)}

    cursor = db.events.find(query).sort("date", 1)
    events = await cursor.to_list(length=100)
    return [format_event_doc(e) for e in events]

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    ev_doc = event_in.dict()
    ev_doc["user_id"] = current_user["_id"]
    ev_doc["created_at"] = now

    # If person_id provided, look up person name if empty
    if ev_doc.get("person_id") and not ev_doc.get("person_name"):
        try:
            person = await db.people.find_one({"_id": ObjectId(ev_doc["person_id"])})
            if person:
                ev_doc["person_name"] = person["name"]
        except Exception:
            pass

    result = await db.events.insert_one(ev_doc)
    ev_doc["_id"] = result.inserted_id
    return format_event_doc(ev_doc)

@router.put("/{id}", response_model=EventResponse)
async def update_event(
    id: str,
    update_in: EventUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event ID")

    event = await db.events.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    updates = {k: v for k, v in update_in.dict(exclude_unset=True).items() if v is not None}
    await db.events.update_one({"_id": oid}, {"$set": updates})
    updated = await db.events.find_one({"_id": oid})
    return format_event_doc(updated)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event ID")

    result = await db.events.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return None
