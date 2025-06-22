from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.subscription import Subscription, SubscriptionCreate, SubscriptionUpdate, SubscriptionWithPayments
from app.services.subscription_service import SubscriptionService
from app.db.database import get_db
from app.db.models import Agent  # Import Agent model if needed for agent management
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

router = APIRouter()

@router.get("/users/{user_id}/subscriptions", response_model=list[Subscription])
def get_subscriptions_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these subscriptions")
    service = SubscriptionService(db)
    return service.get_subscriptions_by_user(user_id)

@router.get("/users/{user_id}/subscriptions/active", response_model=list[Subscription])
def get_active_subscriptions_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these subscriptions")
    service = SubscriptionService(db)
    return service.get_active_subscriptions_by_user(user_id)

@router.get("/subscriptions", response_model=list[Subscription])
def get_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = SubscriptionService(db)
    return service.get_subscriptions()

@router.get("/subscriptions/active", response_model=list[Subscription])
def get_active_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = SubscriptionService(db)
    return service.get_active_subscriptions()

@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionWithPayments)
def get_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = SubscriptionService(db)
    subscription = service.get_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this subscription")
    return subscription

@router.post("/subscriptions", response_model=Subscription)
def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriptionService(db)
    data = subscription.dict(exclude={"agent_ids"})
    data["user_id"] = current_user.id
    new_subscription = service.create_subscription(data)

    # Assign agents to the subscription
    agents = db.query(Agent).filter(Agent.id.in_(subscription.agent_ids)).all()
    if len(agents) != len(subscription.agent_ids):
        db.rollback()  # Rollback the subscription creation
        raise HTTPException(status_code=400, detail="One or more agent IDs do not exist.")
    new_subscription.agents = agents
    db.commit()
    db.refresh(new_subscription)
    return new_subscription

@router.put("/subscriptions/{subscription_id}", response_model=Subscription)
def update_subscription(
    subscription_id: int,
    subscription_update: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriptionService(db)
    subscription = service.get_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this subscription")

    update_data = subscription_update.dict(exclude_unset=True, exclude={"agent_ids"})
    updated_subscription = service.update_subscription(subscription, update_data)

    # If agent_ids provided, update agents
    if hasattr(subscription_update, "agent_ids") and subscription_update.agent_ids is not None:
        agents = db.query(Agent).filter(Agent.id.in_(subscription_update.agent_ids)).all()
        if len(agents) != len(subscription_update.agent_ids):
            db.rollback()  # Rollback any changes
            raise HTTPException(status_code=400, detail="One or more agent IDs do not exist.")
        updated_subscription.agents = agents
        db.commit()
        db.refresh(updated_subscription)

    return updated_subscription


@router.delete("/subscriptions/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = SubscriptionService(db)
    subscription = service.get_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this subscription")
    service.delete_subscription(subscription)
    return {"detail": "Subscription deleted"}