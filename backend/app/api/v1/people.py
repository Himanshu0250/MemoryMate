from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.person import (
    PersonCreate,
    PersonUpdate,
    PersonResponse,
    PersonDetailResponse
)
from app.api.deps import get_current_user
from app.ai.service import get_ai_service

router = APIRouter(prefix="/people", tags=["People"])

def format_person_doc(doc: dict, memory_count: int = 0, gift_count: int = 0, upcoming_event: dict = None) -> PersonResponse:
    return PersonResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        name=doc["name"],
        relationship=doc.get("relationship", "Friend"),
        avatar_url=doc.get("avatar_url") or f"https://api.dicebear.com/7.x/personas/svg?seed={doc['name']}",
        birthday=doc.get("birthday"),
        interests=doc.get("interests", []),
        favorite_things=doc.get("favorite_things", {}),
        notes=doc.get("notes"),
        ai_summary=doc.get("ai_summary"),
        memory_count=memory_count,
        gift_count=gift_count,
        upcoming_event=upcoming_event,
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at", datetime.now(timezone.utc))
    )

@router.get("", response_model=List[PersonResponse])
async def list_people(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    cursor = db.people.find({"user_id": current_user["_id"]}).sort("name", 1)
    people = await cursor.to_list(length=100)
    
    result = []
    for p in people:
        pid = str(p["_id"])
        mem_count = await db.memories.count_documents({"user_id": current_user["_id"], "person_id": pid})
        gift_count = await db.gift_ideas.count_documents({"user_id": current_user["_id"], "person_id": pid})
        
        # Check upcoming event
        up_event = await db.events.find_one(
            {"user_id": current_user["_id"], "person_id": pid, "date": {"$gte": datetime.now(timezone.utc)}},
            sort=[("date", 1)]
        )
        up_event_dict = None
        if up_event:
            up_event_dict = {
                "title": up_event["title"],
                "date": up_event["date"].isoformat() if hasattr(up_event["date"], 'isoformat') else str(up_event["date"]),
                "type": up_event.get("type", "event")
            }

        result.append(format_person_doc(p, mem_count, gift_count, up_event_dict))
    
    return result

@router.post("", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
async def create_person(
    person_in: PersonCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    p_doc = person_in.dict()
    p_doc["user_id"] = current_user["_id"]
    if not p_doc.get("avatar_url"):
        p_doc["avatar_url"] = f"https://api.dicebear.com/7.x/personas/svg?seed={person_in.name}"
    p_doc["created_at"] = now
    p_doc["updated_at"] = now

    result = await db.people.insert_one(p_doc)
    p_doc["_id"] = result.inserted_id

    # If birthday is given, auto-create a recurring Birthday event!
    if person_in.birthday:
        try:
            # e.g. 1998-10-15 -> upcoming this year or next year
            parts = person_in.birthday.split("-")
            month, day = int(parts[1]), int(parts[2])
            bday_date = datetime(now.year, month, day)
            if bday_date < now:
                bday_date = datetime(now.year + 1, month, day)
            await db.events.insert_one({
                "user_id": current_user["_id"],
                "person_id": str(result.inserted_id),
                "person_name": person_in.name,
                "title": f"{person_in.name}'s Birthday",
                "type": "birthday",
                "date": bday_date,
                "recurring": True,
                "recurrence_pattern": "yearly",
                "reminder_days_before": [7, 3, 1, 0],
                "notes": f"Birthday reminder for {person_in.name}",
                "created_at": now
            })
        except Exception:
            pass

    return format_person_doc(p_doc, 0, 0, None)

@router.get("/{id}", response_model=PersonDetailResponse)
async def get_person_detail(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid person ID")

    person = await db.people.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    pid_str = str(person["_id"])
    
    # Fetch all memories for this person sorted chronologically
    mem_cursor = db.memories.find({
        "user_id": current_user["_id"],
        "$or": [{"person_id": pid_str}, {"person_name": {"$regex": f"^{person['name']}$", "$options": "i"}}]
    }).sort("date", -1)
    memories = await mem_cursor.to_list(length=100)

    # Fetch gift ideas
    gift_cursor = db.gift_ideas.find({"user_id": current_user["_id"], "person_id": pid_str})
    gifts = await gift_cursor.to_list(length=50)

    # Fetch events
    event_cursor = db.events.find({"user_id": current_user["_id"], "person_id": pid_str}).sort("date", 1)
    events = await event_cursor.to_list(length=50)

    formatted_memories = [
        {
            "id": str(m["_id"]),
            "title": m["title"],
            "description": m["description"],
            "date": m.get("date", m.get("created_at")),
            "category": m.get("category"),
            "tags": m.get("tags", []),
            "importance": m.get("importance"),
            "mood": m.get("mood"),
            "image_url": m.get("image_url"),
            "is_favorite": m.get("is_favorite", False)
        } for m in memories
    ]

    formatted_gifts = [
        {
            "id": str(g["_id"]),
            "gift_name": g["gift_name"],
            "reason": g.get("reason"),
            "estimated_price": g.get("estimated_price"),
            "is_purchased": g.get("is_purchased", False),
            "purchased_date": g.get("purchased_date")
        } for g in gifts
    ]

    formatted_events = [
        {
            "id": str(e["_id"]),
            "title": e["title"],
            "date": e["date"],
            "type": e.get("type"),
            "recurring": e.get("recurring", False)
        } for e in events
    ]

    base_resp = format_person_doc(person, len(memories), len(gifts))
    return PersonDetailResponse(
        **base_resp.dict(),
        memories=formatted_memories,
        gift_ideas=formatted_gifts,
        events=formatted_events
    )

@router.put("/{id}", response_model=PersonResponse)
async def update_person(
    id: str,
    update_in: PersonUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid person ID")

    person = await db.people.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    updates = {k: v for k, v in update_in.dict(exclude_unset=True).items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)

    await db.people.update_one({"_id": oid}, {"$set": updates})
    updated = await db.people.find_one({"_id": oid})
    
    mem_count = await db.memories.count_documents({"user_id": current_user["_id"], "person_id": id})
    gift_count = await db.gift_ideas.count_documents({"user_id": current_user["_id"], "person_id": id})
    return format_person_doc(updated, mem_count, gift_count)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_person(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid person ID")

    result = await db.people.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Person not found")

    # Unlink person from memories
    await db.memories.update_many(
        {"user_id": current_user["_id"], "person_id": id},
        {"$set": {"person_id": None}}
    )
    return None

@router.post("/{id}/generate-summary")
async def generate_person_summary_endpoint(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid person ID")

    person = await db.people.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    mem_cursor = db.memories.find({"user_id": current_user["_id"], "person_id": id})
    memories = await mem_cursor.to_list(length=50)

    ai_service = get_ai_service()
    summary = await ai_service.generate_person_summary(person, memories)

    # Save summary back to person document
    await db.people.update_one({"_id": oid}, {"$set": {"ai_summary": summary, "updated_at": datetime.now(timezone.utc)}})
    return {"summary": summary}
