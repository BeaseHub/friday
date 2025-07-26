from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    is_systen: bool = False
    content: str
    file_path: Optional[str] = None

class MessageCreate(MessageBase):
    conversation_id: Optional[int] = None  # Now optional, for first message

class MessageUpdate(BaseModel):
    is_systen: Optional[bool] = None
    content: Optional[str] = None
    file_path: Optional[str] = None

class MessageInDB(MessageBase):
    id: int
    conversation_id: int
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True  # For Pydantic v1  # For Pydantic v2 compatibility

# For reading with nested conversation
from app.schemas.conversation import ConversationInDB
class Message(MessageInDB):
    conversation: Optional[ConversationInDB] = None

    class Config:
        orm_mode = True