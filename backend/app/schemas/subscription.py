from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SubscriptionStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    cancelled = "cancelled"
    expired = "expired"

class SubscriptionBase(BaseModel):
    plan_id: int
    started_at: Optional[datetime] = None
    expire_at: Optional[datetime] = None
    status: Optional[SubscriptionStatus] = SubscriptionStatus.active

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    plan_id: Optional[int] = None
    started_at: Optional[datetime] = None
    expire_at: Optional[datetime] = None
    status: Optional[SubscriptionStatus] = None

class Subscription(SubscriptionBase):
    id: int
    user_id: int  # Only in the response model
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# For nested payments
from app.schemas.payment import Payment
class SubscriptionWithPayments(Subscription):
    payments: List[Payment] = []