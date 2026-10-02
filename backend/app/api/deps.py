from typing import Generator, Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from app.core.security import decode_access_token
from app.database.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

security_scheme = HTTPBearer(auto_error=True)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict[str, Any]:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired or missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token does not exist",
        )
    return user
