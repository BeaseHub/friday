from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ConversationBase(BaseModel):
    user_id: int

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    user_id: Optional[int] = None

class ConversationInDB(ConversationBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# For reading with nested messages
from app.schemas.message import Message
class Conversation(ConversationInDB):
    messages: List[Message] = []