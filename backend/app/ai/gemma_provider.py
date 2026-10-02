import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.core.config import settings
from app.ai.base import BaseAIService
from app.ai.fallback_provider import FallbackAIService
from app.schemas.ai import (
    ExtractedMemoryResponse,
    RAGSearchResponse,
    ChatResponse,
    MemoryConnectionsResponse,
    MemoryConnectionItem
)
from app.schemas.gift import GiftRecommendationResponse, GiftSuggestion
from app.schemas.memory import MemoryCategory, MemoryImportance, MemoryMood

logger = logging.getLogger("memorymate.ai.gemma")

class GemmaAIService(BaseAIService):
    """
    Open-Weight AI Service using Google Gemma models via Ollama or Open-Weight Cloud Endpoints (Groq / vLLM / HuggingFace).
    Cascades gracefully to FallbackAIService on timeout or server absence.
    """
    def __init__(self):
        self.fallback = FallbackAIService()
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.cloud_api_key = settings.OPENWEIGHT_API_KEY
        self.cloud_base_url = settings.OPENWEIGHT_BASE_URL
        self.cloud_model = settings.OPENWEIGHT_MODEL

    async def _call_llm(self, prompt: str, system_prompt: str = "", is_json: bool = False) -> Optional[str]:
        """Attempt to call local Ollama first, then cloud open-weight provider, return None if unavailable."""
        # 1. Try local Ollama
        try:
            req_body = {
                "model": self.model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False
            }
            if is_json:
                req_body["format"] = "json"

            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json=req_body
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response")
        except Exception:
            pass

        # 2. Try Open-Weight Cloud API if key provided
        if self.cloud_api_key:
            try:
                headers = {
                    "Authorization": f"Bearer {self.cloud_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.cloud_model,
                    "messages": [
                        {"role": "system", "content": system_prompt or "You are MemoryMate AI, an empathetic memory assistant powered by Gemma."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                if is_json:
                    payload["response_format"] = {"type": "json_object"}

                async with httpx.AsyncClient(timeout=7.0) as client:
                    res = await client.post(
                        f"{self.cloud_base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    if res.status_code == 200:
                        data = res.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"Cloud open-weight call notice: {e}")

        return None

    async def extract_memory(self, raw_text: str) -> ExtractedMemoryResponse:
        system = """You are Gemma AI for MemoryMate. Extract structured memory data in JSON with fields:
{
  "title": "short concise title",
  "description": "clean detailed description",
  "person_name": "Person name or null",
  "category": "Friendship|Family|Birthday|Gift|Food|Travel|Hobby|Conversation|Study|Work|Important|Other",
  "tags": ["list", "of", "tags"],
  "importance": "low|medium|high|critical",
  "mood": "happy|neutral|reflective|excited|touched|grateful|loving",
  "preferences": ["likes/preferences mentioned"],
  "ai_gift_ideas": ["possible gift ideas"]
}"""
        prompt = f"Extract structured memory information from this note: \"{raw_text}\""
        response = await self._call_llm(prompt, system, is_json=True)
        
        if response:
            try:
                data = json.loads(response)
                cat_val = data.get("category", "Conversation")
                category = MemoryCategory(cat_val) if cat_val in MemoryCategory._value2member_map_ else MemoryCategory.CONVERSATION
                
                imp_val = data.get("importance", "medium")
                importance = MemoryImportance(imp_val) if imp_val in MemoryImportance._value2member_map_ else MemoryImportance.MEDIUM
                
                mood_val = data.get("mood", "happy")
                mood = MemoryMood(mood_val) if mood_val in MemoryMood._value2member_map_ else MemoryMood.HAPPY

                return ExtractedMemoryResponse(
                    title=data.get("title") or raw_text[:50],
                    description=data.get("description") or raw_text,
                    date=datetime.now(timezone.utc),
                    person_name=data.get("person_name"),
                    category=category,
                    tags=data.get("tags", []),
                    importance=importance,
                    mood=mood,
                    ai_gift_ideas=data.get("ai_gift_ideas", []),
                    preferences=data.get("preferences", []),
                    interests=data.get("tags", []),
                    confidence_score=0.98,
                    source_raw_text=raw_text
                )
            except Exception as e:
                logger.warning(f"Failed to parse Gemma output ({e}), cascading to Fallback engine.")

        return await self.fallback.extract_memory(raw_text)

    async def rag_search(self, query: str, memories: List[Dict[str, Any]]) -> RAGSearchResponse:
        return await self.fallback.rag_search(query, memories)

    async def chat_response(
        self,
        message: str,
        history: List[Dict[str, Any]],
        memories: List[Dict[str, Any]],
        conversation_id: str,
        people: Optional[List[Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None
    ) -> ChatResponse:
        people = people or []
        events = events or []

        # 1. RAG Search to find matching memories
        rag_res = await self.fallback.rag_search(message, memories)
        top_memories = rag_res.source_memories

        # Build context from memories, people, and events
        context_parts = []
        if top_memories:
            mem_lines = [
                f"- [Memory Title: {m.get('title')}] (Person: {m.get('person_name', 'None')}, Date: {m.get('date', 'Unknown')}, Category: {m.get('category', 'General')}): {m.get('description')}"
                for m in top_memories[:5]
            ]
            context_parts.append("STORED RELEVANT MEMORIES:\n" + "\n".join(mem_lines))

        # Check matched people
        matched_people = [p for p in people if p.get("name") and p["name"].lower() in message.lower()]
        if matched_people:
            ppl_lines = [
                f"- Friend Profile: {p.get('name')} | Relationship: {p.get('relationship', 'Friend')} | Birthday: {p.get('birthday', 'N/A')} | Interests: {', '.join(p.get('interests', []))}"
                for p in matched_people
            ]
            context_parts.append("FRIEND PROFILES:\n" + "\n".join(ppl_lines))

        # Check matched events
        matched_events = [e for e in events if any(k.lower() in message.lower() for k in [e.get('title', ''), e.get('person_name', '')])]
        if matched_events:
            ev_lines = [
                f"- Milestone/Event: {e.get('title')} on {e.get('date')} for {e.get('person_name', 'Friend')}"
                for e in matched_events
            ]
            context_parts.append("UPCOMING & PAST EVENTS:\n" + "\n".join(ev_lines))

        full_context = "\n\n".join(context_parts) if context_parts else "No direct matching memories found."

        system = """You are MemoryMate AI, an empathetic, helpful, and private memory assistant powered by open-weight Gemma AI.
Your purpose is to answer the user's question directly using the provided memory vault context.

Rules:
1. Answer the user's specific question directly with conversational warmth.
2. Ground your answer in the provided memories, friend profiles, and events.
3. If the context contains the answer, explain it clearly with exact details (e.g. food preferences, dates, gifts, travel plans).
4. If there is no relevant information in the context, politely state that you couldn't find relevant memories in the vault, and suggest what they can record.
5. Never invent or hallucinate private facts.
6. Clearly distinguish stored facts from AI gift suggestions."""

        prompt = f"""User Question: {message}

Context from User's Private Memory Vault:
{full_context}

Provide a thoughtful, structured response in clean Markdown:"""

        # Development Server-Side Logging
        logger.info(f"\n==================== [MemoryMate AI Query Pipeline] ====================")
        logger.info(f"USER QUESTION: {message}")
        logger.info(f"MEMORY SEARCH: Found {len(top_memories)} memories, {len(matched_people)} people profiles, {len(matched_events)} events")
        logger.info(f"AI PROMPT:\n{prompt}")

        response = await self._call_llm(prompt, system, is_json=False)
        
        if response and len(response.strip()) > 8:
            logger.info(f"AI RESPONSE (from Gemma LLM):\n{response.strip()}")
            logger.info(f"========================================================================\n")
            return ChatResponse(
                conversation_id=conversation_id,
                message=response.strip(),
                source_memories=top_memories,
                suggested_followups=[
                    "What gift ideas do I have for them?",
                    "When is their next birthday or event?",
                    "Show recent memories"
                ]
            )

        # Fallback to smart rule-based reasoning engine
        fallback_resp = await self.fallback.chat_response(message, history, memories, conversation_id, people, events)
        logger.info(f"AI RESPONSE (from Smart Context Engine):\n{fallback_resp.message}")
        logger.info(f"========================================================================\n")
        return fallback_resp

    async def recommend_gifts(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> GiftRecommendationResponse:
        return await self.fallback.recommend_gifts(person, memories)

    async def find_connections(
        self,
        memories: List[Dict[str, Any]],
        events: List[Dict[str, Any]]
    ) -> MemoryConnectionsResponse:
        return await self.fallback.find_connections(memories, events)

    async def generate_person_summary(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> str:
        name = person.get("name", "Friend")
        context = "\n".join([f"- {m.get('title')}: {m.get('description')}" for m in memories[:5]])
        system = "You are Gemma AI. Summarize a friend's profile and personality based on memories in 2-3 warm, heartfelt sentences."
        prompt = f"Friend: {name}\nMemories:\n{context}\nSummary:"
        
        response = await self._call_llm(prompt, system, is_json=False)
        if response and len(response.strip()) > 10:
            return response.strip()
            
        return await self.fallback.generate_person_summary(person, memories)

