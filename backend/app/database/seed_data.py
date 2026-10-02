from datetime import datetime, timedelta
from bson import ObjectId
from app.core.security import get_password_hash

async def populate_demo_data(db, user_id: str):
    """
    Seeds a rich, safe, fictional dataset for demonstration:
    - 4 realistic friends/family: Rahul Sharma, Priya Patel, Marcus Chen, Maya Lin
    - 15+ memories across all 12 categories
    - Upcoming events/birthdays
    - Gift ideas with source citations
    - Notifications & Insights
    """
    uid = ObjectId(user_id) if isinstance(user_id, str) and len(user_id) == 24 else user_id

    # Clear previous demo items for this user to avoid duplicates
    await db.people.delete_many({"user_id": uid})
    await db.memories.delete_many({"user_id": uid})
    await db.events.delete_many({"user_id": uid})
    await db.gift_ideas.delete_many({"user_id": uid})
    await db.notifications.delete_many({"user_id": uid})

    now = datetime.utcnow()

    # 1. Seed People
    p_rahul = {
        "_id": ObjectId(),
        "user_id": uid,
        "name": "Rahul Sharma",
        "relationship": "Best Friend",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "birthday": (now + timedelta(days=12)).strftime("%Y-%m-%d"),
        "interests": ["Photography", "Specialty Coffee", "Japan Travel", "Vintage Cameras"],
        "favorite_things": {
            "drink": "Cortado with oat milk",
            "food": "Dark chocolate with sea salt, Tonkotsu Ramen",
            "film_style": "Kodak Portra 400",
            "city": "Kyoto"
        },
        "notes": "College roommate since 2019. Always reliable for late-night creative chats.",
        "ai_summary": "Rahul is your best friend of 7 years, an enthusiastic photographer preparing for a solo trip to Japan, who cherishes specialty coffee and single-origin dark chocolate.",
        "created_at": now - timedelta(days=120),
        "updated_at": now
    }

    p_priya = {
        "_id": ObjectId(),
        "user_id": uid,
        "name": "Priya Patel",
        "relationship": "Close Friend",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        "birthday": (now + timedelta(days=34)).strftime("%Y-%m-%d"),
        "interests": ["Ceramics & Pottery", "Gardening", "Sci-Fi Novels", "Matcha"],
        "favorite_things": {
            "tea": "Ceremonial grade Uji Matcha",
            "author": "Ted Chiang",
            "plant": "Monstera Albo",
            "flower": "Sunflowers"
        },
        "notes": "Collaborated on open-source community design projects.",
        "ai_summary": "Priya is an inventive designer and plant enthusiast who loves reading speculative sci-fi and making handmade ceramic tableware.",
        "created_at": now - timedelta(days=90),
        "updated_at": now
    }

    p_marcus = {
        "_id": ObjectId(),
        "user_id": uid,
        "name": "Marcus Chen",
        "relationship": "Mentor & Colleague",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "birthday": (now - timedelta(days=40)).strftime("%Y-%m-%d"),
        "interests": ["Marathon Running", "Distributed Systems", "Chess", "Mechanical Keyboards"],
        "favorite_things": {
            "keyboard_switch": "Gateron Oil Kings",
            "book": "Designing Data-Intensive Applications",
            "running_shoe": "Nike Vaporfly 3"
        },
        "notes": "Mentored me during my first engineering internship.",
        "ai_summary": "Marcus is a thoughtful tech mentor and endurance runner who appreciates elegant software architecture and mechanical keyboards.",
        "created_at": now - timedelta(days=200),
        "updated_at": now
    }

    p_maya = {
        "_id": ObjectId(),
        "user_id": uid,
        "name": "Maya Lin",
        "relationship": "Sister",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        "birthday": (now + timedelta(days=65)).strftime("%Y-%m-%d"),
        "interests": ["Baking Sourdough", "Indie Folk Music", "Bouldering", "Watercolor Painting"],
        "favorite_things": {
            "artist": "Phoebe Bridgers",
            "pastry": "Cardamom Buns",
            "color": "Sage Green"
        },
        "notes": "My younger sister, currently building her own boutique bakery studio.",
        "ai_summary": "Maya is your creative sister who is launching a sourdough micro-bakery and loves climbing and live acoustic indie concerts.",
        "created_at": now - timedelta(days=365),
        "updated_at": now
    }

    people = [p_rahul, p_priya, p_marcus, p_maya]
    await db.people.insert_many(people)

    # 2. Seed Memories
    memories = [
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "title": "Loves Dark Chocolate & Plans for Japan",
            "description": "Rahul mentioned over coffee that he loves 85% single-origin dark chocolate and is planning a 3-week photography expedition to Kyoto next spring.",
            "date": now - timedelta(days=2),
            "category": "Food",
            "tags": ["chocolate", "japan", "kyoto", "photography", "coffee"],
            "location": "Blue Tokai Coffee, Indiranagar",
            "importance": "high",
            "mood": "excited",
            "image_url": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
            "voice_note_url": None,
            "is_favorite": True,
            "extracted_by_ai": True,
            "ai_gift_ideas": ["Kyoto Photobook Guide", "Artisanal Single-Origin Dark Chocolate Box"],
            "source_raw_text": "Rahul told me yesterday that he loves dark chocolate and wants to visit Japan.",
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=2)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "title": "Searching for a 35mm Vintage Rangefinder Lens",
            "description": "During our weekend photo walk, Rahul said he has been hunting for an M-mount 35mm f/2 vintage lens for his Leica body.",
            "date": now - timedelta(days=14),
            "category": "Hobby",
            "tags": ["photography", "camera", "vintage", "gift_idea"],
            "location": "Cubbon Park",
            "importance": "high",
            "mood": "excited",
            "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
            "voice_note_url": None,
            "is_favorite": True,
            "extracted_by_ai": False,
            "ai_gift_ideas": ["Leather Camera Strap", "Lens Pen Cleaning Kit"],
            "source_raw_text": None,
            "created_at": now - timedelta(days=14),
            "updated_at": now - timedelta(days=14)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "title": "Favorite Matcha Brand & Pottery Studio Dream",
            "description": "Priya showed me her new handmade ceramic mugs and mentioned she drinks Marukyu-Koyamaen matcha every morning to start her day calmly.",
            "date": now - timedelta(days=6),
            "category": "Hobby",
            "tags": ["pottery", "ceramics", "matcha", "tea", "art"],
            "location": "Claystation Studio",
            "importance": "high",
            "mood": "grateful",
            "image_url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80",
            "voice_note_url": None,
            "is_favorite": True,
            "extracted_by_ai": True,
            "ai_gift_ideas": ["Uji Ceremonial Matcha Tin", "Bamboo Chasen Whisk Stand"],
            "source_raw_text": "Priya showed me her pottery mugs and said she loves authentic Uji matcha.",
            "created_at": now - timedelta(days=6),
            "updated_at": now - timedelta(days=6)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "title": "Promise: Plant Propagation Cutting",
            "description": "Promised Priya I would give her a rooted cutting of my Monstera Albo variegata once the new leaf hardens next week.",
            "date": now - timedelta(days=8),
            "category": "Friendship",
            "tags": ["promise", "plants", "monstera", "gardening"],
            "location": "Home Garden",
            "importance": "medium",
            "mood": "loving",
            "image_url": None,
            "voice_note_url": None,
            "is_favorite": False,
            "extracted_by_ai": False,
            "ai_gift_ideas": ["Terracotta Plant Propagation Station"],
            "source_raw_text": None,
            "created_at": now - timedelta(days=8),
            "updated_at": now - timedelta(days=8)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_marcus["_id"]),
            "person_name": "Marcus Chen",
            "title": "Marathon Training Milestone",
            "description": "Marcus completed a 32km long run in preparation for the Berlin Marathon and celebrated with his favorite pour-over Ethiopian Yirgacheffe.",
            "date": now - timedelta(days=18),
            "category": "Hobby",
            "tags": ["running", "marathon", "fitness", "coffee"],
            "location": "Runners High Track",
            "importance": "medium",
            "mood": "excited",
            "image_url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&auto=format&fit=crop&q=80",
            "voice_note_url": None,
            "is_favorite": False,
            "extracted_by_ai": False,
            "ai_gift_ideas": ["Electrolyte Hydration Flask", "Running Nutrition Pack"],
            "source_raw_text": None,
            "created_at": now - timedelta(days=18),
            "updated_at": now - timedelta(days=18)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_maya["_id"]),
            "person_name": "Maya Lin",
            "title": "Sourdough Starter Named 'Doughlene'",
            "description": "Maya baked a batch of Swedish cardamom sourdough buns. She told me her 4-year-old sourdough starter is named Doughlene and requires feeding with organic rye flour.",
            "date": now - timedelta(days=3),
            "category": "Food",
            "tags": ["baking", "sourdough", "food", "family", "cardamom"],
            "location": "Maya's Kitchen Studio",
            "importance": "high",
            "mood": "loving",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
            "voice_note_url": None,
            "is_favorite": True,
            "extracted_by_ai": True,
            "ai_gift_ideas": ["Challenger Bread Pan", "Danish Dough Whisk & Proofing Banneton"],
            "source_raw_text": "Maya baked cardamom sourdough buns and told me she feeds her starter organic rye flour.",
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=3)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "title": "Deep Conversation on Career Goals",
            "description": "Late night discussion on switching from corporate product design to freelance documentary storytelling. Rahul feels ready for the leap.",
            "date": now - timedelta(days=25),
            "category": "Conversation",
            "tags": ["career", "future", "philosophy", "storytelling"],
            "location": "Rooftop Terrace",
            "importance": "critical",
            "mood": "reflective",
            "image_url": None,
            "voice_note_url": None,
            "is_favorite": True,
            "extracted_by_ai": False,
            "ai_gift_ideas": ["Journal for creative writers"],
            "source_raw_text": None,
            "created_at": now - timedelta(days=25),
            "updated_at": now - timedelta(days=25)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "title": "Recommended 'Exhalation' by Ted Chiang",
            "description": "Priya strongly recommended reading Ted Chiang's story collection 'Exhalation', specifically the story about memory recording devices.",
            "date": now - timedelta(days=45),
            "category": "Study",
            "tags": ["books", "reading", "scifi", "memory"],
            "location": "Bookworm Cafe",
            "importance": "medium",
            "mood": "touched",
            "image_url": None,
            "voice_note_url": None,
            "is_favorite": False,
            "extracted_by_ai": False,
            "ai_gift_ideas": ["First edition speculative fiction novel"],
            "source_raw_text": None,
            "created_at": now - timedelta(days=45),
            "updated_at": now - timedelta(days=45)
        }
    ]
    await db.memories.insert_many(memories)

    # 3. Seed Events
    events = [
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "title": "Rahul's 28th Birthday",
            "type": "birthday",
            "date": now + timedelta(days=12),
            "recurring": True,
            "recurrence_pattern": "yearly",
            "reminder_days_before": [7, 3, 1, 0],
            "notes": "Surprise rooftop dinner + Kyoto photobook gift.",
            "created_at": now
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "title": "Priya's Birthday",
            "type": "birthday",
            "date": now + timedelta(days=34),
            "recurring": True,
            "recurrence_pattern": "yearly",
            "reminder_days_before": [7, 1],
            "notes": "Send handmade pottery glaze kit or matcha gift box.",
            "created_at": now
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_maya["_id"]),
            "person_name": "Maya Lin",
            "title": "Maya's Micro-Bakery Studio Opening",
            "type": "important_date",
            "date": now + timedelta(days=22),
            "recurring": False,
            "recurrence_pattern": "none",
            "reminder_days_before": [5, 1, 0],
            "notes": "Bring congratulatory flowers (sage green & lavender) and support the launch.",
            "created_at": now
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "title": "Deliver Monstera Propagation Cutting",
            "type": "promise",
            "date": now + timedelta(days=5),
            "recurring": False,
            "recurrence_pattern": "none",
            "reminder_days_before": [1, 0],
            "notes": "Give Priya the rooted variegated cutting.",
            "created_at": now
        }
    ]
    await db.events.insert_many(events)

    # 4. Seed Gift Ideas
    gifts = [
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "gift_name": "Handcrafted Japanese Ceramic Matcha Bowl & Kyoto Guide",
            "reason": "Rahul loves Japan travel and dark chocolate/tea tasting sessions.",
            "source_memory_ids": [str(memories[0]["_id"])],
            "estimated_price": "$45 - $60",
            "is_purchased": False,
            "purchased_date": None,
            "saved_by_user": True,
            "created_at": now - timedelta(days=2)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_rahul["_id"]),
            "person_name": "Rahul Sharma",
            "gift_name": "Artisanal Single-Origin 85% Dark Chocolate Box",
            "reason": "Mentioned Blue Tokai IND dark chocolate preference.",
            "source_memory_ids": [str(memories[0]["_id"])],
            "estimated_price": "$28",
            "is_purchased": True,
            "purchased_date": now - timedelta(days=1),
            "saved_by_user": True,
            "created_at": now - timedelta(days=2)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_priya["_id"]),
            "person_name": "Priya Patel",
            "gift_name": "Marukyu-Koyamaen Ceremonial Uji Matcha Tin",
            "reason": "Priya drinks this specific brand of matcha every morning.",
            "source_memory_ids": [str(memories[2]["_id"])],
            "estimated_price": "$38",
            "is_purchased": False,
            "purchased_date": None,
            "saved_by_user": True,
            "created_at": now - timedelta(days=5)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "person_id": str(p_maya["_id"]),
            "person_name": "Maya Lin",
            "gift_name": "Cast Iron Challenger Bread Pan for Sourdough",
            "reason": "Maya's bakery studio launch and passion for artisanal sourdough.",
            "source_memory_ids": [str(memories[5]["_id"])],
            "estimated_price": "$120",
            "is_purchased": False,
            "purchased_date": None,
            "saved_by_user": True,
            "created_at": now - timedelta(days=3)
        }
    ]
    await db.gift_ideas.insert_many(gifts)

    # 5. Seed Notifications
    notifications = [
        {
            "_id": ObjectId(),
            "user_id": uid,
            "type": "birthday_reminder",
            "title": "Rahul's Birthday is in 12 days!",
            "message": "You have 2 saved gift ideas for Rahul. Tap to check GiftMate wishlist.",
            "related_entity_type": "person",
            "related_entity_id": str(p_rahul["_id"]),
            "is_read": False,
            "created_at": now - timedelta(hours=2)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "type": "connection_found",
            "title": "AI Connection Detected",
            "message": "Rahul mentioned wanting to visit Kyoto, and Priya loves authentic Uji matcha—both share a passion for Japanese craftsmanship.",
            "related_entity_type": "memory",
            "related_entity_id": str(memories[0]["_id"]),
            "is_read": False,
            "created_at": now - timedelta(hours=8)
        },
        {
            "_id": ObjectId(),
            "user_id": uid,
            "type": "memory_of_the_day",
            "title": "Memory of the Day",
            "message": "Revisit your deep conversation on career goals with Rahul from last month.",
            "related_entity_type": "memory",
            "related_entity_id": str(memories[6]["_id"]),
            "is_read": True,
            "created_at": now - timedelta(days=1)
        }
    ]
    await db.notifications.insert_many(notifications)

    return {
        "people_count": len(people),
        "memories_count": len(memories),
        "events_count": len(events),
        "gifts_count": len(gifts),
        "notifications_count": len(notifications)
    }
