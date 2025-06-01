from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class PlanBase(BaseModel):
    name: str
    description: str
    price: Optional[float] = None
    feature_list: Optional[List[Any]] = None
    max_agents: int
    is_active: Optional[bool] = True
    image_path: Optional[str] = None

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    feature_list: Optional[List[Any]] = None
    max_agents: Optional[int] = None
    is_active: Optional[bool] = None
    image_path: Optional[str] = None

class Plan(PlanBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True