import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "MemoryMate"

@pytest.mark.asyncio
async def test_auth_and_memory_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register test user
        reg_payload = {
            "name": "Sarah Connor",
            "email": "sarah@example.com",
            "password": "strongPassword123"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        data_reg = res_reg.json()
        token = data_reg["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get profile
        res_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "sarah@example.com"

        # 3. Test AI Extraction
        extract_payload = {"raw_text": "Rahul told me yesterday that he loves dark chocolate and wants to visit Japan."}
        res_extract = await ac.post("/api/v1/ai/extract", json=extract_payload, headers=headers)
        assert res_extract.status_code == 200
        ext_data = res_extract.json()
        assert ext_data["person_name"] == "Rahul"
        assert "chocolate" in ext_data["tags"] or "japan" in ext_data["tags"]
        assert len(ext_data["ai_gift_ideas"]) > 0

        # 4. Create Memory
        mem_payload = {
            "title": ext_data["title"],
            "description": ext_data["description"],
            "person_name": ext_data["person_name"],
            "category": ext_data["category"],
            "tags": ext_data["tags"],
            "importance": ext_data["importance"],
            "mood": ext_data["mood"],
            "ai_gift_ideas": ext_data["ai_gift_ideas"],
            "is_favorite": True
        }
        res_mem = await ac.post("/api/v1/memories", json=mem_payload, headers=headers)
        assert res_mem.status_code == 201
        created_mem = res_mem.json()
        mem_id = created_mem["id"]
        assert created_mem["is_favorite"] is True

        # 5. List Memories
        res_list = await ac.get("/api/v1/memories", headers=headers)
        assert res_list.status_code == 200
        list_data = res_list.json()
        assert list_data["total"] >= 1

        # 6. RAG Search
        search_payload = {"query": "What does Rahul like?"}
        res_search = await ac.post("/api/v1/ai/search", json=search_payload, headers=headers)
        assert res_search.status_code == 200
        search_data = res_search.json()
        assert len(search_data["source_memories"]) >= 1

        # 7. AI Chat
        chat_payload = {"message": "Tell me about Rahul's preferences"}
        res_chat = await ac.post("/api/v1/ai/chat", json=chat_payload, headers=headers)
        assert res_chat.status_code == 200
        chat_data = res_chat.json()
        assert "Rahul" in chat_data["message"] or len(chat_data["source_memories"]) >= 1

        # 8. People directory
        res_people = await ac.get("/api/v1/people", headers=headers)
        assert res_people.status_code == 200
        people = res_people.json()
        assert len(people) >= 1

        # 9. Analytics
        res_analytics = await ac.get("/api/v1/analytics/overview", headers=headers)
        assert res_analytics.status_code == 200
        analytics = res_analytics.json()
        assert analytics["total_memories"] >= 1

        # 10. Privacy Export
        res_export = await ac.get("/api/v1/privacy/export", headers=headers)
        assert res_export.status_code == 200
        assert "app" in res_export.json()
        assert res_export.json()["app"] == "MemoryMate"

@pytest.mark.asyncio
async def test_google_sign_in():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test registering/logging in with Google profile
        google_payload = {
            "email": "priya.google@gmail.com",
            "name": "Priya Sharma",
            "picture": "https://lh3.googleusercontent.com/a/sample-photo",
            "sub": "google-oauth2-109283748291"
        }
        res_google = await ac.post("/api/v1/auth/google", json=google_payload)
        assert res_google.status_code == 200
        data = res_google.json()
        assert "access_token" in data
        assert data["user"]["email"] == "priya.google@gmail.com"
        assert data["user"]["name"] == "Priya Sharma"
        assert data["user"]["avatar_url"] == "https://lh3.googleusercontent.com/a/sample-photo"

        # Test logging in again with the same Google account
        res_google_again = await ac.post("/api/v1/auth/google", json=google_payload)
        assert res_google_again.status_code == 200
        data_again = res_google_again.json()
        assert data_again["user"]["id"] == data["user"]["id"]

@pytest.mark.asyncio
async def test_ai_chat_dynamic_different_responses():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user with auto-seeded memories
        reg_payload = {
            "name": "David Miller",
            "email": "david.test@example.com",
            "password": "strongPassword123"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        token = res_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Question: What does Rahul like?
        res_likes = await ac.post("/api/v1/ai/chat", json={"message": "What does Rahul like?"}, headers=headers)
        assert res_likes.status_code == 200
        msg_likes = res_likes.json()["message"]
        assert "Rahul" in msg_likes
        assert "chocolate" in msg_likes.lower() or "japan" in msg_likes.lower() or "photography" in msg_likes.lower()

        # 2. Question: When is Rahul's birthday?
        res_bday = await ac.post("/api/v1/ai/chat", json={"message": "When is Rahul's birthday?"}, headers=headers)
        assert res_bday.status_code == 200
        msg_bday = res_bday.json()["message"]
        assert "Birthday" in msg_bday or "birthday" in msg_bday

        # 3. Question: What gift should I give Rahul?
        res_gift = await ac.post("/api/v1/ai/chat", json={"message": "What gift should I give Rahul?"}, headers=headers)
        assert res_gift.status_code == 200
        msg_gift = res_gift.json()["message"]
        assert "gift" in msg_gift.lower() or "recommendation" in msg_gift.lower() or "🎁" in msg_gift

        # 4. Question: Tell me something about my memories.
        res_sum = await ac.post("/api/v1/ai/chat", json={"message": "Tell me something about my memories."}, headers=headers)
        assert res_sum.status_code == 200
        msg_sum = res_sum.json()["message"]
        assert "memories" in msg_sum.lower() or "vault" in msg_sum.lower()

        # Confirm all 4 responses are distinct and context-tailored
        assert msg_likes != msg_bday
        assert msg_likes != msg_gift
        assert msg_bday != msg_gift
        assert msg_sum != msg_likes


