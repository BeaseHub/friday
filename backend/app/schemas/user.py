from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    type: Optional[str] = "user"  # or admin, default is "user"
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture_path: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str  # Plain password for creation

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture_path: Optional[str] = None
    is_active: Optional[bool] = None  # Allow user to activate/deactivate

class ChangePassword(BaseModel):
    old_password: str
    new_password: str  # New password for changing the existing one
    email: Optional[str] = None  # optional if needed

class User(UserBase):
    id: int
    email_verified_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True