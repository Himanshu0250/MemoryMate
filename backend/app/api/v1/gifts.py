from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.gift import (
    GiftCreate,
    GiftUpdate,
    GiftResponse,
    GiftRecommendationRequest,
    GiftRecommendationResponse
)
from app.api.deps import get_current_user
from app.ai.service import get_ai_service

router = APIRouter(prefix="/gifts", tags=["GiftMate"])

def format_gift_doc(doc: dict, source_mems: list = None) -> GiftResponse:
    return GiftResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        person_id=str(doc["person_id"]) if doc.get("person_id") else None,
        person_name=doc.get("person_name", "Friend"),
        gift_name=doc["gift_name"],
        reason=doc["reason"],
        source_memory_ids=doc.get("source_memory_ids", []),
        source_memories=source_mems or [],
        estimated_price=doc.get("estimated_price", "$25 - $50"),
        is_purchased=doc.get("is_purchased", False),
        purchased_date=doc.get("purchased_date"),
        saved_by_user=doc.get("saved_by_user", True),
        created_at=doc.get("created_at", datetime.now(timezone.utc))
    )

@router.get("", response_model=List[GiftResponse])
async def list_gifts(
    person_id: Optional[str] = None,
    is_purchased: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"user_id": current_user["_id"]}
    if person_id:
        query["person_id"] = person_id
    if is_purchased is not None:
        query["is_purchased"] = is_purchased

    cursor = db.gift_ideas.find(query).sort("created_at", -1)
    gifts = await cursor.to_list(length=100)
    
    formatted = []
    for g in gifts:
        # Load source memories if any
        source_mems = []
        if g.get("source_memory_ids"):
            m_oids = []
            for mid in g["source_memory_ids"]:
                try:
                    m_oids.append(ObjectId(mid))
                except Exception:
                    pass
            if m_oids:
                m_cursor = db.memories.find({"_id": {"$in": m_oids}})
                m_list = await m_cursor.to_list(length=10)
                source_mems = [{"id": str(m["_id"]), "title": m["title"], "description": m["description"]} for m in m_list]
        
        formatted.append(format_gift_doc(g, source_mems))

    return formatted

@router.post("", response_model=GiftResponse, status_code=status.HTTP_201_CREATED)
async def create_gift(
    gift_in: GiftCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    g_doc = gift_in.dict()
    g_doc["user_id"] = current_user["_id"]
    g_doc["created_at"] = now

    result = await db.gift_ideas.insert_one(g_doc)
    g_doc["_id"] = result.inserted_id
    return format_gift_doc(g_doc)

@router.post("/recommend", response_model=GiftRecommendationResponse)
async def recommend_gifts_endpoint(
    req: GiftRecommendationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        pid = ObjectId(req.person_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid person ID")

    person = await db.people.find_one({"_id": pid, "user_id": current_user["_id"]})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Fetch person's memories
    mem_cursor = db.memories.find({
        "user_id": current_user["_id"],
        "$or": [{"person_id": req.person_id}, {"person_name": {"$regex": f"^{person['name']}$", "$options": "i"}}]
    })
    memories = await mem_cursor.to_list(length=50)

    ai_service = get_ai_service()
    recommendations = await ai_service.recommend_gifts(person, memories)
    return recommendations

@router.patch("/{id}/purchased", response_model=GiftResponse)
async def toggle_purchased(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid gift ID")

    gift = await db.gift_ideas.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift idea not found")

    new_status = not gift.get("is_purchased", False)
    purchased_date = datetime.now(timezone.utc) if new_status else None
    
    await db.gift_ideas.update_one(
        {"_id": oid},
        {"$set": {"is_purchased": new_status, "purchased_date": purchased_date}}
    )
    gift["is_purchased"] = new_status
    gift["purchased_date"] = purchased_date
    return format_gift_doc(gift)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift(
    id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid gift ID")

    result = await db.gift_ideas.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gift idea not found")
    return None
