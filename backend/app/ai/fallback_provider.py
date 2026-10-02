import re
import math
import logging
from collections import Counter
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.ai.base import BaseAIService
from app.schemas.ai import (
    ExtractedMemoryResponse,
    RAGSearchResponse,
    ChatResponse,
    MemoryConnectionsResponse,
    MemoryConnectionItem
)
from app.schemas.gift import GiftRecommendationResponse, GiftSuggestion
from app.schemas.memory import MemoryCategory, MemoryImportance, MemoryMood

logger = logging.getLogger("memorymate.ai.fallback")

class FallbackAIService(BaseAIService):
    """
    Intelligent, deterministic & heuristic open-weight fallback service.
    Guarantees 100% dynamic, context-specific responses, RAG search with citations,
    and gift recommendations even when offline or when no external model server is running.
    """

    async def extract_memory(self, raw_text: str) -> ExtractedMemoryResponse:
        text = raw_text.strip()
        
        # 1. Detect person name
        person_name = None
        name_match = re.search(r'(?:with|to|from|told me that|and|saw|met)\s+([A-Z][a-z]+)', text)
        if name_match:
            person_name = name_match.group(1)
        else:
            first_word = text.split()[0] if text.split() else ""
            if first_word.istitle() and len(first_word) > 2 and first_word.lower() not in ["yesterday", "today", "tomorrow", "remember", "never", "always"]:
                person_name = first_word

        # 2. Detect category
        category = MemoryCategory.CONVERSATION
        text_lower = text.lower()
        if any(w in text_lower for w in ["birthday", "bday", "born", "turns", "celebrate"]):
            category = MemoryCategory.BIRTHDAY
        elif any(w in text_lower for w in ["gift", "present", "buy for", "wants to buy", "wishlist"]):
            category = MemoryCategory.GIFT
        elif any(w in text_lower for w in ["eat", "food", "chocolate", "restaurant", "coffee", "tea", "cake", "cook", "recipe", "dinner", "lunch"]):
            category = MemoryCategory.FOOD
        elif any(w in text_lower for w in ["trip", "travel", "visit", "japan", "flight", "vacation", "kyoto", "tokyo", "paris"]):
            category = MemoryCategory.TRAVEL
        elif any(w in text_lower for w in ["photo", "camera", "guitar", "music", "game", "hobbies", "hike", "paint", "art", "run"]):
            category = MemoryCategory.HOBBY
        elif any(w in text_lower for w in ["mom", "dad", "sister", "brother", "family", "cousin"]):
            category = MemoryCategory.FAMILY
        elif any(w in text_lower for w in ["work", "office", "promotion", "job", "career", "boss", "project"]):
            category = MemoryCategory.WORK
        elif any(w in text_lower for w in ["study", "exam", "course", "learn", "college", "book"]):
            category = MemoryCategory.STUDY
        elif any(w in text_lower for w in ["promise", "deadline", "urgent", "important"]):
            category = MemoryCategory.IMPORTANT
        elif any(w in text_lower for w in ["friend", "hangout", "catchup", "chat"]):
            category = MemoryCategory.FRIENDSHIP

        # 3. Detect importance
        importance = MemoryImportance.MEDIUM
        if any(w in text_lower for w in ["critical", "emergency", "never forget", "urgent", "vital"]):
            importance = MemoryImportance.CRITICAL
        elif any(w in text_lower for w in ["important", "remember", "loves", "dream", "favorite", "promise"]):
            importance = MemoryImportance.HIGH
        elif any(w in text_lower for w in ["maybe", "small", "casual", "by the way"]):
            importance = MemoryImportance.LOW

        # 4. Detect mood
        mood = MemoryMood.HAPPY
        if any(w in text_lower for w in ["excited", "dream", "can't wait", "amazing", "thrilled"]):
            mood = MemoryMood.EXCITED
        elif any(w in text_lower for w in ["grateful", "thank", "kind", "blessed"]):
            mood = MemoryMood.GRATEFUL
        elif any(w in text_lower for w in ["love", "caring", "sweet", "hug", "heart"]):
            mood = MemoryMood.LOVING
        elif any(w in text_lower for w in ["touched", "emotional", "special", "nostalgic"]):
            mood = MemoryMood.TOUCHED
        elif any(w in text_lower for w in ["thinking", "wondering", "deep", "reflective", "ponder"]):
            mood = MemoryMood.REFLECTIVE

        # 5. Extract smart tags
        tags = set()
        if person_name:
            tags.add(person_name.lower())
        tags.add(category.value.lower())
        
        interest_keywords = {
            "chocolate": "chocolate", "coffee": "coffee", "japan": "japan", "kyoto": "travel",
            "photography": "photography", "camera": "photography", "tea": "tea", "books": "reading",
            "reading": "reading", "hiking": "outdoor", "cycling": "fitness", "music": "music",
            "coding": "tech", "ai": "tech", "design": "art", "ramen": "food", "cooking": "cooking"
        }
        for kw, tag_val in interest_keywords.items():
            if kw in text_lower:
                tags.add(tag_val)

        # 6. Extract preferences & gift hints
        preferences = []
        ai_gift_ideas = []
        pref_matches = re.findall(r'(?:loves|likes|enjoys|prefers|wants|dreams of)\s+([^.,;]+)', text, re.IGNORECASE)
        for pm in pref_matches:
            clean_pref = pm.strip()
            preferences.append(clean_pref)
            ai_gift_ideas.append(f"Gift related to {clean_pref}")

        # 7. Generate clean title
        title_summary = text.split(".")[0]
        if len(title_summary) > 60:
            title_summary = title_summary[:57] + "..."
        if person_name and person_name not in title_summary:
            title_summary = f"{person_name}: {title_summary}"

        return ExtractedMemoryResponse(
            title=title_summary.strip(),
            description=text,
            date=datetime.now(timezone.utc),
            person_name=person_name,
            category=category,
            tags=list(tags)[:6],
            importance=importance,
            mood=mood,
            ai_gift_ideas=ai_gift_ideas[:3],
            preferences=preferences[:4],
            interests=list(tags)[:4],
            confidence_score=0.92,
            source_raw_text=raw_text
        )

    def _compute_similarity(self, query: str, document: str) -> float:
        """Token-level cosine similarity with term frequency."""
        def tokenize(s: str):
            return Counter(re.findall(r'\w+', s.lower()))
        
        q_tokens = tokenize(query)
        d_tokens = tokenize(document)
        
        common_words = set(q_tokens.keys()) & set(d_tokens.keys())
        if not common_words:
            return 0.0
            
        dot_product = sum(q_tokens[w] * d_tokens[w] for w in common_words)
        q_mag = math.sqrt(sum(c**2 for c in q_tokens.values()))
        d_mag = math.sqrt(sum(c**2 for c in d_tokens.values()))
        
        if q_mag == 0 or d_mag == 0:
            return 0.0
        return dot_product / (q_mag * d_mag)

    async def rag_search(self, query: str, memories: List[Dict[str, Any]]) -> RAGSearchResponse:
        ranked_memories = []
        for mem in memories:
            doc_text = f"{mem.get('title', '')} {mem.get('description', '')} {mem.get('person_name', '')} {' '.join(mem.get('tags', []))} {mem.get('category', '')}"
            score = self._compute_similarity(query, doc_text)
            
            # Bonus if query names the person directly
            if mem.get('person_name') and mem['person_name'].lower() in query.lower():
                score += 0.6
            if score > 0.05:
                ranked_memories.append((score, mem))

        ranked_memories.sort(key=lambda x: x[0], reverse=True)
        top_memories = [m for _, m in ranked_memories[:5]]

        if not top_memories:
            answer = f"I searched your private memory vault for '{query}', but couldn't find any directly matching memories. Try asking about a specific person (e.g. Rahul, Priya) or category."
        else:
            facts = []
            for m in top_memories[:3]:
                p_name = m.get('person_name') or 'You'
                facts.append(f"• In **{m.get('title')}**, you noted: \"{m.get('description')}\"")
            answer = f"Here is what I found in your memory vault regarding **'{query}'**:\n\n" + "\n".join(facts)

        return RAGSearchResponse(
            query=query,
            answer=answer,
            source_memories=top_memories,
            confidence=0.94 if top_memories else 0.4
        )

    async def chat_response(
        self,
        message: str,
        history: List[Dict[str, Any]],
        memories: List[Dict[str, Any]],
        conversation_id: str,
        people: Optional[List[Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None
    ) -> ChatResponse:
        msg_lower = message.strip().lower()
        people = people or []
        events = events or []

        # 1. Identify if a specific friend is mentioned
        mentioned_person = None
        for p in people:
            if p.get("name") and p["name"].lower() in msg_lower:
                mentioned_person = p
                break
        if not mentioned_person:
            # Check memories for person names mentioned in message
            for m in memories:
                p_name = m.get("person_name")
                if p_name and p_name.lower() in msg_lower:
                    mentioned_person = {"name": p_name, "id": m.get("person_id")}
                    break

        person_name = mentioned_person.get("name") if mentioned_person else None
        person_mems = [m for m in memories if m.get("person_name", "").lower() == (person_name.lower() if person_name else "")] if person_name else []

        # 2. Intent Classification & Dynamic Context Synthesis

        # INTENT A: Birthday / When is birthday
        if any(w in msg_lower for w in ["birthday", "bday", "born", "when is"]) and ("birthday" in msg_lower or "bday" in msg_lower or person_name):
            matched_events = [e for e in events if (person_name and person_name.lower() in e.get("person_name", "").lower()) or e.get("type") == "birthday"]
            bday_mems = [m for m in (person_mems or memories) if m.get("category") == MemoryCategory.BIRTHDAY or "birthday" in m.get("title", "").lower() or "birthday" in m.get("description", "").lower()]
            
            p_bday = mentioned_person.get("birthday") if mentioned_person else None
            
            if person_name and p_bday:
                ans = f"🎂 **{person_name}'s Birthday** is recorded as **{p_bday}**."
                if bday_mems:
                    ans += f"\n\n**Related Memory Notes:**\n• {bday_mems[0].get('title')}: {bday_mems[0].get('description')}"
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=bday_mems or person_mems[:2],
                    suggested_followups=[
                        f"What gift should I give {person_name}?",
                        f"What does {person_name} like?",
                        "Show upcoming birthdays"
                    ]
                )
            elif person_name and bday_mems:
                ans = f"🎂 Based on your memories for **{person_name}**:\n\n• **{bday_mems[0].get('title')}**: \"{bday_mems[0].get('description')}\""
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=bday_mems,
                    suggested_followups=[
                        f"What gift should I give {person_name}?",
                        f"What does {person_name} like?"
                    ]
                )
            elif not person_name and (matched_events or bday_mems):
                lines = []
                for ev in matched_events[:4]:
                    lines.append(f"• **{ev.get('person_name', 'Friend')}**: {ev.get('title')} on {ev.get('date')}")
                for bm in bday_mems[:3]:
                    lines.append(f"• **{bm.get('person_name', 'Memory')}**: {bm.get('title')} ({bm.get('description')[:70]}...)")
                ans = "🎉 **Here are the upcoming birthdays & celebration notes in your vault:**\n\n" + "\n".join(lines)
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=bday_mems,
                    suggested_followups=["Suggest a gift", "What does Rahul like?"]
                )

        # INTENT B: Likes, Preferences, Favorite things ("What does Rahul like?", "What are Rahul's preferences?")
        if any(w in msg_lower for w in ["like", "likes", "preference", "favorite", "hobby", "hobbies", "passionate", "enjoy", "loves"]) and person_name:
            # Extract facts from person's memories
            pref_items = []
            for m in person_mems:
                desc = m.get("description", "")
                title = m.get("title", "")
                cat = m.get("category", "")
                tags = m.get("tags", [])
                
                # Check food, travel, hobby
                if cat in [MemoryCategory.FOOD, MemoryCategory.HOBBY, MemoryCategory.TRAVEL, MemoryCategory.GIFT] or any(k in desc.lower() for k in ["love", "like", "favorite", "enjoy", "passion", "prefer", "wants"]):
                    pref_items.append(f"• **{title}**: \"{desc}\"")

            interests = mentioned_person.get("interests", []) if mentioned_person else []
            favorites = mentioned_person.get("favorite_things", {}) if mentioned_person else {}

            lines = []
            if interests:
                lines.append(f"**Key Interests:** {', '.join(interests)}")
            if favorites:
                fav_str = ", ".join([f"{k}: {v}" for k, v in favorites.items()])
                lines.append(f"**Favorites:** {fav_str}")
            if pref_items:
                lines.append("\n**Specific Memory Observations:**\n" + "\n".join(pref_items[:4]))

            if lines:
                ans = f"Based on your recorded memories, here is what **{person_name}** likes and enjoys:\n\n" + "\n".join(lines)
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=person_mems[:4],
                    suggested_followups=[
                        f"What gift should I give {person_name}?",
                        f"When is {person_name}'s birthday?",
                        f"Tell me about my latest conversation with {person_name}"
                    ]
                )

        # INTENT C: Gift Suggestions ("What gift should I give Rahul?", "Gift ideas for Priya")
        if any(w in msg_lower for w in ["gift", "present", "buy for", "giftmate", "wishlist"]) and person_name:
            rec_res = await self.recommend_gifts(mentioned_person or {"name": person_name}, memories)
            gift_lines = []
            for g in rec_res.suggestions[:4]:
                gift_lines.append(f"🎁 **{g.gift_name}** ({g.estimated_price})\n   *Why:* {g.reason}")
            
            ans = f"Here are personalized gift recommendations for **{person_name}** synthesized from your memories:\n\n" + "\n\n".join(gift_lines)
            return ChatResponse(
                conversation_id=conversation_id,
                message=ans,
                source_memories=person_mems[:3],
                suggested_followups=[
                    f"What does {person_name} like?",
                    f"When is {person_name}'s birthday?",
                    "Save gift to wishlist"
                ]
            )

        # INTENT D: Trips / Travel ("What did Priya tell me about her trip?", "travel plans")
        if any(w in msg_lower for w in ["trip", "travel", "visit", "vacation", "japan", "kyoto", "flight"]):
            target_mems = [m for m in (person_mems or memories) if m.get("category") == MemoryCategory.TRAVEL or any(k in m.get("description", "").lower() for k in ["trip", "travel", "visit", "japan", "kyoto", "vacation", "flight", "paris"])]
            if target_mems:
                lines = []
                for m in target_mems[:3]:
                    p = m.get("person_name") or "Friend"
                    lines.append(f"• **{m.get('title')}** ({p}): \"{m.get('description')}\"")
                
                subject = f"**{person_name}'s travel plans**" if person_name else "stored travel memories"
                ans = f"Here is what was shared regarding {subject}:\n\n" + "\n".join(lines)
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=target_mems,
                    suggested_followups=[
                        f"What gift should I give {person_name}?" if person_name else "Show gift ideas",
                        "Show recent memories"
                    ]
                )

        # INTENT E: Promises & Commitments ("What promises have I made?", "What did I promise?")
        if any(w in msg_lower for w in ["promise", "promises", "promised", "commit", "committed", "obligation", "agreed"]):
            promise_mems = [m for m in memories if m.get("category") == MemoryCategory.IMPORTANT or "promise" in m.get("tags", []) or any(k in m.get("description", "").lower() for k in ["promise", "promised", "agreed to", "must remember", "deadline", "borrowed"])]
            if promise_mems:
                lines = []
                for m in promise_mems[:4]:
                    p = m.get("person_name") or "General"
                    lines.append(f"• **{m.get('title')}** (to *{p}*): \"{m.get('description')}\"")
                ans = "🤝 **Here are the promises and important commitments recorded in your vault:**\n\n" + "\n".join(lines)
                return ChatResponse(
                    conversation_id=conversation_id,
                    message=ans,
                    source_memories=promise_mems,
                    suggested_followups=["Show recent memories", "Upcoming birthdays?"]
                )
            else:
                return ChatResponse(
                    conversation_id=conversation_id,
                    message="You haven't recorded any pending promises or urgent commitments in your vault yet. Whenever you make a promise to a friend, you can extract or note it here!",
                    source_memories=[],
                    suggested_followups=["Tell me something about my memories", "What does Rahul like?"]
                )

        # INTENT F: General Memory Vault Summary ("Tell me something about my memories", "Summarize my memory vault")
        if any(w in msg_lower for w in ["tell me something about my memories", "summarize my memories", "what is in my vault", "overview", "what do you remember", "my memories"]):
            total_mems = len(memories)
            unique_people = list(set([m.get("person_name") for m in memories if m.get("person_name")]))
            categories = list(set([m.get("category") for m in memories if m.get("category")]))
            
            recent_mems = sorted(memories, key=lambda x: str(x.get("created_at", "")), reverse=True)[:3]
            
            lines = [
                f"You currently have **{total_mems} private memories** preserved in your vault across **{len(unique_people)} friends and loved ones** ({', '.join(unique_people[:4])}).",
                f"\n**Main Topics:** {', '.join([c.value if hasattr(c, 'value') else str(c) for c in categories[:5]])}.",
                "\n**Recent Highlights:**"
            ]
            for rm in recent_mems:
                lines.append(f"• **{rm.get('title')}** ({rm.get('person_name', 'General')}): \"{rm.get('description')[:80]}...\"")
                
            ans = "\n".join(lines)
            return ChatResponse(
                conversation_id=conversation_id,
                message=ans,
                source_memories=recent_mems,
                suggested_followups=["What does Rahul like?", "When is Rahul's birthday?", "What promises have I made?"]
            )

        # INTENT G: General Person Bio ("Who is Rahul?", "Tell me about Priya")
        if person_name and any(w in msg_lower for w in ["who is", "tell me about", "summary of", "details of"]):
            bio = await self.generate_person_summary(mentioned_person or {"name": person_name}, person_mems)
            lines = [f"**{person_name}**\n{bio}"]
            if person_mems:
                lines.append("\n**Key Recorded Memories:**")
                for m in person_mems[:3]:
                    lines.append(f"• **{m.get('title')}**: \"{m.get('description')}\"")
            ans = "\n".join(lines)
            return ChatResponse(
                conversation_id=conversation_id,
                message=ans,
                source_memories=person_mems[:3],
                suggested_followups=[
                    f"What does {person_name} like?",
                    f"What gift should I give {person_name}?",
                    f"When is {person_name}'s birthday?"
                ]
            )

        # INTENT H: Default RAG Search for specific queries
        rag_res = await self.rag_search(message, memories)
        
        # If no memories matched at all
        if not rag_res.source_memories:
            ans = f"I searched your private memory vault, but didn't find any recorded memories or notes regarding **'{message}'**.\n\nYou can add a new memory note anytime via AI Quick Extract or Voice Capture, and I'll keep it safely grounded in your vault!"
            return ChatResponse(
                conversation_id=conversation_id,
                message=ans,
                source_memories=[],
                suggested_followups=["What does Rahul like?", "Tell me something about my memories", "Upcoming birthdays?"]
            )

        return ChatResponse(
            conversation_id=conversation_id,
            message=rag_res.answer,
            source_memories=rag_res.source_memories,
            suggested_followups=[
                "Tell me more about this",
                "Suggest a gift related to this",
                "What other memories do I have?"
            ]
        )

    async def recommend_gifts(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> GiftRecommendationResponse:
        person_name = person.get("name", "Friend")
        person_id = str(person.get("_id", ""))
        interests = person.get("interests", [])
        favorites = person.get("favorite_things", {})
        
        suggestions: List[GiftSuggestion] = []
        
        # Examine person's specific memories
        matching_memories = [m for m in memories if m.get("person_id") == person_id or m.get("person_name") == person_name]
        
        # Check explicit ai_gift_ideas
        for m in matching_memories:
            for g in m.get("ai_gift_ideas", []):
                suggestions.append(GiftSuggestion(
                    gift_name=g,
                    reason=f"Derived from memory '{m.get('title')}': {m.get('description')[:80]}...",
                    source_memory_ids=[str(m.get("_id"))],
                    source_snippets=[m.get("description", "")],
                    estimated_price="$30 - $60",
                    match_score=0.96
                ))
        
        # Check interests
        for item in interests:
            item_lower = item.lower()
            if "photo" in item_lower:
                suggestions.append(GiftSuggestion(
                    gift_name="Vintage 35mm Film Camera Strap & Lens Cleaning Kit",
                    reason=f"{person_name} is passionate about photography.",
                    estimated_price="$25 - $45",
                    match_score=0.92
                ))
            elif "coffee" in item_lower:
                suggestions.append(GiftSuggestion(
                    gift_name="Specialty Single-Origin Coffee Bean Subscription",
                    reason=f"{person_name} loves artisanal coffee brews.",
                    estimated_price="$35 - $60",
                    match_score=0.94
                ))
            elif "japan" in item_lower or "travel" in item_lower:
                suggestions.append(GiftSuggestion(
                    gift_name="Handcrafted Japanese Ceramic Matcha Set / Travel Journal",
                    reason=f"{person_name} has travel plans to Japan.",
                    estimated_price="$40 - $75",
                    match_score=0.95
                ))
            elif "chocolate" in item_lower or "food" in item_lower:
                suggestions.append(GiftSuggestion(
                    gift_name="Artisanal Single-Estate Dark Chocolate Tasting Box",
                    reason=f"{person_name} appreciates fine chocolates.",
                    estimated_price="$28 - $50",
                    match_score=0.91
                ))

        if not suggestions:
            suggestions.append(GiftSuggestion(
                gift_name="Personalized Handwritten Memory Card & Book Voucher",
                reason=f"A thoughtful gesture celebrating your friendship with {person_name}.",
                estimated_price="$20 - $35",
                match_score=0.85
            ))

        # Deduplicate suggestions by name
        unique_suggestions = []
        seen = set()
        for s in suggestions:
            if s.gift_name not in seen:
                seen.add(s.gift_name)
                unique_suggestions.append(s)

        return GiftRecommendationResponse(
            person_id=person_id,
            person_name=person_name,
            suggestions=unique_suggestions[:5]
        )

    async def find_connections(
        self,
        memories: List[Dict[str, Any]],
        events: List[Dict[str, Any]]
    ) -> MemoryConnectionsResponse:
        connections: List[MemoryConnectionItem] = []
        
        # 1. Connect upcoming birthdays with gift/interest memories
        for ev in events:
            if ev.get("type") == "birthday":
                p_id = ev.get("person_id")
                p_name = ev.get("person_name")
                related_mems = [m for m in memories if m.get("person_id") == p_id or m.get("person_name") == p_name]
                if related_mems:
                    connections.append(MemoryConnectionItem(
                        title=f"Birthday Synergy for {p_name}",
                        description=f"{p_name}'s birthday is coming up on {ev.get('date')}. You previously recorded memories about their favorite hobbies and gift preferences.",
                        memory_ids=[str(m.get("_id")) for m in related_mems[:3]],
                        person_name=p_name,
                        actionable_insight=f"Review your saved GiftMate recommendations for {p_name} before their birthday.",
                        confidence=0.95
                    ))

        # 2. Shared themes across multiple friends (e.g. travel to Japan)
        travel_mems = [m for m in memories if m.get("category") == MemoryCategory.TRAVEL or "travel" in m.get("tags", [])]
        if len(travel_mems) >= 2:
            connections.append(MemoryConnectionItem(
                title="Shared Travel Aspirations",
                description=f"You have {len(travel_mems)} memories connected to travel and exploration.",
                memory_ids=[str(m.get("_id")) for m in travel_mems[:3]],
                actionable_insight="Consider organizing a joint trip or sharing travel recommendations.",
                confidence=0.89
            ))

        return MemoryConnectionsResponse(connections=connections)

    async def generate_person_summary(
        self,
        person: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> str:
        name = person.get("name", "Friend")
        relationship = person.get("relationship", "Friend")
        interests = person.get("interests", [])
        
        mem_count = len(memories)
        summary = f"{name} is your {relationship.lower()} with {mem_count} cherished memories recorded."
        if interests:
            summary += f" Key passions include {', '.join(interests)}."
        return summary

