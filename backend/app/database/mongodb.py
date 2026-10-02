import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient
from app.core.config import settings

logger = logging.getLogger("memorymate.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    is_mock: bool = False

db_manager = Database()

async def get_database() -> AsyncIOMotorDatabase:
    """Dependency injector for database session."""
    if db_manager.db is None:
        await connect_to_mongo()
    return db_manager.db

async def connect_to_mongo():
    """Connect to MongoDB or fallback to in-memory async mock."""
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000
        )
        # Verify connection
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.MONGODB_DB_NAME]
        db_manager.is_mock = False
        logger.info("Successfully connected to live MongoDB!")
    except Exception as e:
        logger.warning(f"Live MongoDB not available ({e}). Initializing In-Memory Async Mongo Engine for zero-config offline mode.")
        mock_client = AsyncMongoMockClient()
        db_manager.client = mock_client
        db_manager.db = mock_client[settings.MONGODB_DB_NAME]
        db_manager.is_mock = True
        logger.info("In-Memory Async Mongo Engine ready.")

    await init_db_indexes(db_manager.db)

async def close_mongo_connection():
    """Close MongoDB connection gracefully."""
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes(db: AsyncIOMotorDatabase):
    """Create indexes for high performance querying."""
    try:
        # Users indexes
        await db.users.create_index("email", unique=True)
        
        # Memories indexes
        await db.memories.create_index([("user_id", 1), ("created_at", -1)])
        await db.memories.create_index([("user_id", 1), ("person_id", 1)])
        await db.memories.create_index([("user_id", 1), ("category", 1)])
        await db.memories.create_index([("user_id", 1), ("is_favorite", 1)])
        
        # People indexes
        await db.people.create_index([("user_id", 1), ("name", 1)])
        
        # Events indexes
        await db.events.create_index([("user_id", 1), ("date", 1)])
        
        # Gifts indexes
        await db.gift_ideas.create_index([("user_id", 1), ("person_id", 1)])
        
        # Notifications indexes
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        
        logger.info("MongoDB database indexes successfully initialized.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")
