from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = "system" # light, dark, system
    ai_settings: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    theme_preference: str = "system"
    ai_settings: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None  # Google ID Token
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    sub: Optional[str] = None  # Google subject ID

