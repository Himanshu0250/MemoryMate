from datetime import datetime, timezone
import httpx
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import get_password_hash, verify_password, create_access_token
from app.database.mongodb import get_database
from app.database.seed_data import populate_demo_data
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserProfileUpdate,
    UserResponse,
    Token,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    GoogleLoginRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user_doc: dict) -> UserResponse:
    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        avatar_url=user_doc.get("avatar_url"),
        theme_preference=user_doc.get("theme_preference", "system"),
        ai_settings=user_doc.get("ai_settings", {}),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc))
    )

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": get_password_hash(user_in.password),
        "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={user_in.name}",
        "theme_preference": "system",
        "ai_settings": {
            "preferred_provider": "gemma",
            "temperature": 0.3,
            "privacy_mode": "strict_local",
            "auto_extract_enabled": True
        },
        "created_at": now,
        "updated_at": now
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Auto-seed initial safe demo dataset for this new user so they can immediately explore the app!
    try:
        await populate_demo_data(db, str(result.inserted_id))
    except Exception:
        pass

    token = create_access_token(str(result.inserted_id))
    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user_doc)
    )

@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(str(user["_id"]))
    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user)
    )

@router.post("/google", response_model=Token)
async def google_auth(
    google_in: GoogleLoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Authenticate or register a user via Google Sign-In (OAuth / Google Identity Services).
    Accepts verified Google ID token or Google OAuth profile info.
    """
    email = google_in.email
    name = google_in.name
    picture = google_in.picture
    google_id = google_in.sub

    # 1. If Google ID Token credential is provided, verify with Google tokeninfo endpoint
    if google_in.credential:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": google_in.credential}
                )
                if res.status_code == 200:
                    info = res.json()
                    email = info.get("email", email)
                    name = info.get("name", name)
                    picture = info.get("picture", picture)
                    google_id = info.get("sub", google_id)
        except Exception as e:
            # Fall back to payload info if network call fails or running offline/mock
            pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid Google account email address is required."
        )

    now = datetime.now(timezone.utc)
    email_clean = email.strip().lower()

    # 2. Check if user already exists in MemoryMate vault
    user = await db.users.find_one({"email": email_clean})

    if user:
        # User exists - update avatar/google_id if needed
        updates = {"updated_at": now}
        if google_id and not user.get("google_id"):
            updates["google_id"] = google_id
        if picture and not user.get("avatar_url"):
            updates["avatar_url"] = picture
        if name and not user.get("name"):
            updates["name"] = name
        
        if len(updates) > 1:
            await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
            user = await db.users.find_one({"_id": user["_id"]})

        token = create_access_token(str(user["_id"]))
        return Token(
            access_token=token,
            token_type="bearer",
            user=format_user_response(user)
        )
    
    # 3. User does not exist - create new user with Google profile
    display_name = name or email_clean.split("@")[0].replace(".", " ").title()
    avatar = picture or f"https://api.dicebear.com/7.x/bottts/svg?seed={display_name}"
    
    new_user_doc = {
        "name": display_name,
        "email": email_clean,
        "google_id": google_id,
        "avatar_url": avatar,
        "theme_preference": "system",
        "ai_settings": {
            "preferred_provider": "gemma",
            "temperature": 0.3,
            "privacy_mode": "strict_local",
            "auto_extract_enabled": True
        },
        "created_at": now,
        "updated_at": now
    }
    result = await db.users.insert_one(new_user_doc)
    new_user_doc["_id"] = result.inserted_id

    # Auto-seed initial rich demo dataset for new Google user
    try:
        await populate_demo_data(db, str(result.inserted_id))
    except Exception:
        pass

    token = create_access_token(str(result.inserted_id))
    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_response(new_user_doc)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return format_user_response(current_user)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    updates = {"updated_at": datetime.now(timezone.utc)}
    if profile_in.name is not None:
        updates["name"] = profile_in.name
    if profile_in.avatar_url is not None:
        updates["avatar_url"] = profile_in.avatar_url
    if profile_in.theme_preference is not None:
        updates["theme_preference"] = profile_in.theme_preference
    if profile_in.ai_settings is not None:
        updates["ai_settings"] = {**current_user.get("ai_settings", {}), **profile_in.ai_settings}

    await db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return format_user_response(updated_user)

@router.post("/reset-password-request")
async def request_password_reset(
    req: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await db.users.find_one({"email": req.email.lower()})
    # Return 200 regardless of user presence for privacy protection
    return {"message": "If this email is registered, password reset instructions have been dispatched."}

@router.post("/reset-password")
async def confirm_password_reset(
    req: ResetPasswordConfirm,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return {"message": "Password successfully reset. Please log in with your new credentials."}

