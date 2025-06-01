from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    subscription_id: Optional[int] = None  # <-- Make this optional
    plan_id: Optional[int] = None          # Needed if creating subscription
    payment_type: str
    currency: str
    amount: float
    transaction_id: str

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payment_type: Optional[str] = None
    currency: Optional[str] = None
    amount: Optional[float] = None
    transaction_id: Optional[str] = None

class Payment(PaymentBase):
    id: int
    user_id: int  # Only in the response model
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True