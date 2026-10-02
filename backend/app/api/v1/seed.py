from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.database.seed_data import populate_demo_data
from app.api.deps import get_current_user

router = APIRouter(prefix="/seed", tags=["Demo Data"])

@router.post("/demo")
async def seed_demo_data_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Populates rich, safe fictional demo profiles (Rahul, Priya, Marcus, Maya),
    memories across 12 categories, events, and gift ideas for the current user.
    """
    result = await populate_demo_data(db, str(current_user["_id"]))
    return {
        "message": "Demo data successfully seeded!",
        "details": result
    }
