from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.ai import (
    MemoryExtractionRequest,
    ExtractedMemoryResponse,
    RAGSearchRequest,
    RAGSearchResponse,
    ChatRequest,
    ChatResponse,
    MemoryConnectionsResponse,
    AIInsightsResponse
)
from app.api.deps import get_current_user
from app.ai.service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/extract", response_model=ExtractedMemoryResponse)
async def extract_memory_endpoint(
    req: MemoryExtractionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    ai_service = get_ai_service()
    extracted = await ai_service.extract_memory(req.raw_text)
    
    # If a person_name was detected, match with existing person_id
    if extracted.person_name:
        existing_p = await db.people.find_one({
            "user_id": current_user["_id"],
            "name": {"$regex": f"^{extracted.person_name}$", "$options": "i"}
        })
        if existing_p:
            extracted.person_id = str(existing_p["_id"])

    return extracted

@router.post("/search", response_model=RAGSearchResponse)
async def semantic_search_endpoint(
    req: RAGSearchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    mem_cursor = db.memories.find({"user_id": current_user["_id"]})
    memories = await mem_cursor.to_list(length=200)

    ai_service = get_ai_service()
    rag_result = await ai_service.rag_search(req.query, memories)
    
    # Format memory sources cleanly
    clean_sources = [
        {
            "id": str(m["_id"]),
            "title": m["title"],
            "description": m["description"],
            "person_name": m.get("person_name"),
            "category": m.get("category"),
            "date": m.get("date")
        }
        for m in rag_result.source_memories
    ]
    rag_result.source_memories = clean_sources
    return rag_result

@router.get("/conversations")
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    cursor = db.conversations.find({"user_id": current_user["_id"]}).sort("updated_at", -1)
    conv_list = await cursor.to_list(length=50)
    
    result = []
    for c in conv_list:
        messages = c.get("messages", [])
        last_msg = messages[-1]["text"] if messages else "New conversation"
        result.append({
            "id": str(c["_id"]),
            "title": c.get("title") or (messages[0]["text"][:35] + "..." if messages else "New Chat"),
            "last_message": last_msg[:60],
            "message_count": len(messages),
            "updated_at": c.get("updated_at", c.get("created_at")),
            "created_at": c.get("created_at")
        })
    return result

@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    conv = await db.conversations.find_one({"_id": conversation_id, "user_id": current_user["_id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "id": str(conv["_id"]),
        "title": conv.get("title", "Chat"),
        "messages": conv.get("messages", []),
        "created_at": conv.get("created_at"),
        "updated_at": conv.get("updated_at")
    }

@router.post("/conversations")
async def create_conversation(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    conv_id = str(ObjectId())
    conv_doc = {
        "_id": conv_id,
        "user_id": current_user["_id"],
        "title": "New Chat",
        "messages": [],
        "created_at": now,
        "updated_at": now
    }
    await db.conversations.insert_one(conv_doc)
    return {"id": conv_id, "title": "New Chat", "created_at": now}

@router.patch("/conversations/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    new_title = body.get("title", "").strip()
    if not new_title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    
    await db.conversations.update_one(
        {"_id": conversation_id, "user_id": current_user["_id"]},
        {"$set": {"title": new_title, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"status": "ok", "title": new_title}

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    await db.conversations.delete_one({"_id": conversation_id, "user_id": current_user["_id"]})
    return {"status": "deleted"}

@router.post("/chat", response_model=ChatResponse)
async def ai_chat_endpoint(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    conv_id = req.conversation_id or str(ObjectId())
    
    # Retrieve user's stored memories, people, and events for maximum contextual grounding
    mem_cursor = db.memories.find({"user_id": current_user["_id"]})
    memories = await mem_cursor.to_list(length=300)

    ppl_cursor = db.people.find({"user_id": current_user["_id"]})
    people = await ppl_cursor.to_list(length=100)

    ev_cursor = db.events.find({"user_id": current_user["_id"]})
    events = await ev_cursor.to_list(length=100)

    history_dicts = [{"sender": h.sender, "text": h.text} for h in req.history]

    ai_service = get_ai_service()
    chat_resp = await ai_service.chat_response(
        message=req.message,
        history=history_dicts,
        memories=memories,
        conversation_id=conv_id,
        people=people,
        events=events
    )

    # Format source memories cleanly
    clean_sources = [
        {
            "id": str(m["_id"]),
            "title": m.get("title", "Memory"),
            "description": m.get("description", ""),
            "person_name": m.get("person_name"),
            "category": m.get("category", "General"),
            "date": m.get("date", datetime.now(timezone.utc)).isoformat() if hasattr(m.get("date"), "isoformat") else str(m.get("date", ""))
        }
        for m in chat_resp.source_memories
    ]
    chat_resp.source_memories = clean_sources

    # Persist chat log in conversations collection
    now = datetime.now(timezone.utc)
    user_msg = {"sender": "user", "text": req.message, "timestamp": now}
    assistant_msg = {
        "sender": "assistant",
        "text": chat_resp.message,
        "source_memories": clean_sources,
        "source_memory_ids": [s["id"] for s in clean_sources],
        "timestamp": now
    }
    
    # Auto-generate title if this is the first user message in conversation
    conv = await db.conversations.find_one({"_id": conv_id, "user_id": current_user["_id"]})
    title = conv.get("title") if conv else None
    if not title or title == "New Chat":
        title = req.message.strip()[:35] + ("..." if len(req.message.strip()) > 35 else "")

    await db.conversations.update_one(
        {"_id": conv_id, "user_id": current_user["_id"]},
        {
            "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
            "$setOnInsert": {"created_at": now},
            "$set": {"updated_at": now, "title": title}
        },
        upsert=True
    )

    return chat_resp

@router.get("/connections", response_model=MemoryConnectionsResponse)
async def get_memory_connections(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    mem_cursor = db.memories.find({"user_id": current_user["_id"]})
    memories = await mem_cursor.to_list(length=100)

    ev_cursor = db.events.find({"user_id": current_user["_id"]})
    events = await ev_cursor.to_list(length=50)

    ai_service = get_ai_service()
    connections = await ai_service.find_connections(memories, events)
    return connections

@router.get("/insights", response_model=AIInsightsResponse)
async def get_ai_insights(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    mem_cursor = db.memories.find({"user_id": current_user["_id"]})
    memories = await mem_cursor.to_list(length=200)

    # Compute people frequency
    people_counts = {}
    topic_counts = {}
    sentiment_counts = {"happy": 0, "excited": 0, "reflective": 0, "loving": 0, "grateful": 0, "touched": 0, "neutral": 0}

    for m in memories:
        p_name = m.get("person_name")
        if p_name:
            people_counts[p_name] = people_counts.get(p_name, 0) + 1
        for tag in m.get("tags", []):
            topic_counts[tag] = topic_counts.get(tag, 0) + 1
        mood = m.get("mood", "happy")
        if mood in sentiment_counts:
            sentiment_counts[mood] += 1
        else:
            sentiment_counts["happy"] += 1

    top_people = [{"person_name": k, "count": v} for k, v in sorted(people_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    top_topics = [{"topic": k, "count": v} for k, v in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:6]]

    # Upcoming events
    ev_cursor = db.events.find({"user_id": current_user["_id"], "date": {"$gte": datetime.now(timezone.utc)}}).sort("date", 1)
    events = await ev_cursor.to_list(length=5)
    upcoming_milestones = [
        {"title": e["title"], "date": e["date"].isoformat() if hasattr(e["date"], "isoformat") else str(e["date"])}
        for e in events
    ]

    # Potential gift ideas from memories
    gift_cursor = db.gift_ideas.find({"user_id": current_user["_id"], "is_purchased": False})
    saved_gifts = await gift_cursor.to_list(length=5)
    gift_ideas_list = [
        {"gift_name": g["gift_name"], "person_name": g.get("person_name", "Friend"), "reason": g.get("reason")}
        for g in saved_gifts
    ]

    return AIInsightsResponse(
        frequently_remembered_people=top_people,
        common_topics=top_topics,
        upcoming_milestones=upcoming_milestones,
        recent_interests=[t["topic"] for t in top_topics[:4]],
        potential_gift_ideas=gift_ideas_list,
        sentiment_distribution=sentiment_counts,
        generated_at=datetime.now(timezone.utc)
    )
