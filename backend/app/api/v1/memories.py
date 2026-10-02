from datetime import datetime, timezone
import random
from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.memory import (
    MemoryCreate,
    MemoryUpdate,
    MemoryResponse,
    MemoryListResponse,
    MemoryCategory,
    MemoryImportance
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/memories", tags=["Memories"])

def format_memory_doc(doc: dict) -> MemoryResponse:
    return MemoryResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        person_id=str(doc["person_id"]) if doc.get("person_id") else None,
        person_name=doc.get("person_name"),
        title=doc["title"],
        description=doc["description"],
        date=doc.get("date", doc.get("created_at", datetime.now(timezone.utc))),
        category=doc.get("category", MemoryCategory.CONVERSATION),
        tags=doc.get("tags", []),
        location=doc.get("location"),
        importance=doc.get("importance", MemoryImportance.MEDIUM),
        mood=doc.get("mood", "happy"),
        image_url=doc.get("image_url"),
        voice_note_url=doc.get("voice_note_url"),
        is_favorite=doc.get("is_favorite", False),
        extracted_by_ai=doc.get("extracted_by_ai", False),
        ai_gift_ideas=doc.get("ai_gift_ideas", []),
        source_raw_text=doc.get("source_raw_text"),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at", datetime.now(timezone.utc))
    )

@router.get("", response_model=MemoryListResponse)
async def list_memories(
    person_id: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    importance: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = "date_desc", # date_desc, date_asc, created_desc, importance
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"user_id": current_user["_id"]}

    if person_id:
        query["person_id"] = person_id
    if category and category != "All":
        query["category"] = category
    if tag:
        query["tags"] = {"$in": [tag.lower()]}
    if is_favorite is not None:
        query["is_favorite"] = is_favorite
    if importance:
        query["importance"] = importance
    if search:
        regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"title": regex},
            {"description": regex},
            {"person_name": regex},
            {"tags": regex},
            {"location": regex}
        ]

    sort_order = [("date", -1)]
    if sort_by == "date_asc":
        sort_order = [("date", 1)]
    elif sort_by == "created_desc":
        sort_order = [("created_at", -1)]
    elif sort_by == "importance":
        sort_order = [("importance", -1), ("date", -1)]

    total = await db.memories.count_documents(query)
    cursor = db.memories.find(query).sort(sort_order).skip((page - 1) * limit).limit(limit)
    memories = await cursor.to_list(length=limit)

    return MemoryListResponse(
        items=[format_memory_doc(m) for m in memories],
        total=total,
        page=page,
        limit=limit
    )

@router.get("/memory-of-the-day", response_model=Optional[MemoryResponse])
async def get_memory_of_the_day(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Fetch favorite or high-importance memories
    cursor = db.memories.find({
        "user_id": current_user["_id"]
    })
    memories = await cursor.to_list(length=100)
    if not memories:
        return None
    
    # Deterministic daily selection based on today's date
    today_int = int(datetime.now(timezone.utc).strftime("%Y%m%d"))
    # Prefer favorites
    favorites = [m for m in memories if m.get("is_favorite")]
    pool = favorites if favorites else memories
    selected = pool[today_int % len(pool)]
    return format_memory_doc(selected)

@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(
    memory_in: MemoryCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    
    # If person_name is given but no person_id, find or auto-link person
    person_id = memory_in.person_id
    if not person_id and memory_in.person_name:
        existing_p = await db.people.find_one({
            "user_id": current_user["_id"],
            "name": {"$regex": f"^{memory_in.person_name}$", "$options": "i"}
        })
        if existing_p:
            person_id = str(existing_p["_id"])
        else:
            # Create lightweight person record
            new_p = {
                "user_id": current_user["_id"],
                "name": memory_in.person_name,
                "relationship": "Friend",
                "avatar_url": f"https://api.dicebear.com/7.x/personas/svg?seed={memory_in.person_name}",
                "interests": [t for t in memory_in.tags if t != memory_in.person_name.lower()],
                "favorite_things": {},
                "created_at": now,
                "updated_at": now
            }
            p_res = await db.people.insert_one(new_p)
            person_id = str(p_res.inserted_id)

    mem_doc = memory_in.dict()
    mem_doc["user_id"] = current_user["_id"]
    mem_doc["person_id"] = person_id
    mem_doc["created_at"] = now
    mem_doc["updated_at"] = now

    result = await db.memories.insert_one(mem_doc)
    mem_doc["_id"] = result.inserted_id
    return format_memory_doc(mem_doc)

@router.get("/{id}", response_model=MemoryResponse)
async def get_memory(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID")

    mem = await db.memories.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    return format_memory_doc(mem)

@router.put("/{id}", response_model=MemoryResponse)
async def update_memory(
    id: str,
    update_in: MemoryUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID")

    mem = await db.memories.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    updates = {k: v for k, v in update_in.dict(exclude_unset=True).items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)

    await db.memories.update_one({"_id": oid}, {"$set": updates})
    updated = await db.memories.find_one({"_id": oid})
    return format_memory_doc(updated)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID")

    result = await db.memories.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found")
    return None

@router.patch("/{id}/favorite", response_model=MemoryResponse)
async def toggle_favorite(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID")

    mem = await db.memories.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    new_fav = not mem.get("is_favorite", False)
    await db.memories.update_one({"_id": oid}, {"$set": {"is_favorite": new_fav, "updated_at": datetime.now(timezone.utc)}})
    mem["is_favorite"] = new_fav
    return format_memory_doc(mem)
