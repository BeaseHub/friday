from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class AgentBase(BaseModel):
    name: str
    price: float
    eleven_labs_id: Optional[str] = None
    description: Optional[str] = None
    feature_list: Optional[List[Any]] = None
    is_active: Optional[bool] = True
    image_path: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    eleven_labs_id: Optional[str] = None
    description: Optional[str] = None
    feature_list: Optional[List[Any]] = None
    is_active: Optional[bool] = None
    image_path: Optional[str] = None


class Agent(AgentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True