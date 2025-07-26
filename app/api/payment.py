from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.payment import Payment, PaymentCreate, PaymentUpdate
from app.services.payment_service import PaymentService
from app.services.subscription_service import SubscriptionService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

router = APIRouter()

@router.get("/users/{user_id}/payments", response_model=list[Payment])
def get_payments_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these payments")
    service = PaymentService(db)
    return service.get_payments_by_user(user_id)

@router.get("/payments/{payment_id}", response_model=Payment)
def get_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = PaymentService(db)
    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this payment")
    return payment

@router.get("/subscriptions/{subscription_id}/payments", response_model=list[Payment])
def get_payments_by_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subscription_service = SubscriptionService(db)
    subscription = subscription_service.get_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access payments for this subscription")
    service = PaymentService(db)
    return service.get_payments_by_subscription(subscription_id)

@router.post("/payments", response_model=Payment)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = PaymentService(db)
    # Ensure the payment is created for the current user
    payment_data = payment.dict()
    payment_data["user_id"] = current_user.id
    try:
        return service.create_payment(payment_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/payments/{payment_id}", response_model=Payment)
def update_payment(payment_id: int, payment_update: PaymentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = PaymentService(db)
    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this payment")
    return service.update_payment(payment, payment_update.dict(exclude_unset=True))

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = PaymentService(db)
    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this payment")
    service.delete_payment(payment)
    return {"detail": "Payment deleted"}