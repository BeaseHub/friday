from sqlalchemy.orm import Session
from app.db.models import Subscription

class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    def get_subscriptions(self):
        return self.db.query(Subscription).all()
    
    def get_active_subscriptions(self):
        return self.db.query(Subscription).filter(Subscription.status == "active").all()
    
    def get_subscriptions_by_user(self, user_id: int):
        return self.db.query(Subscription).filter(Subscription.user_id == user_id).all()
    
    def get_active_subscriptions_by_user(self, user_id: int):
        subscription = (
            self.db.query(Subscription)
            .filter(
                Subscription.user_id == user_id,
                Subscription.status == "active"
            )
            .order_by(Subscription.created_at.desc())
            .first()
        )
        return [subscription] if subscription else []
    

    def get_subscription(self, subscription_id: int):
        return self.db.query(Subscription).filter(Subscription.id == subscription_id).first()

    def create_subscription(self, subscription_data: dict):
        # If the new subscription is active, set all previous subscriptions for the user to inactive
        if subscription_data.get("status", "active") == "active":
            self.db.query(Subscription).filter(
                Subscription.user_id == subscription_data["user_id"],
                Subscription.status == "active"
            ).update({"status": "inactive"})
            self.db.flush()  # Ensure the update is applied before insert

        subscription = Subscription(**subscription_data)
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def update_subscription(self, subscription: Subscription, update_data: dict):
         # If status is being set to active, deactivate other active subscriptions for this user
        if update_data.get("status") == "active":
            self.db.query(Subscription).filter(
                Subscription.user_id == subscription.user_id,
                Subscription.status == "active",
                Subscription.id != subscription.id
            ).update({"status": "inactive"})
            self.db.flush()

        for key, value in update_data.items():
            setattr(subscription, key, value)
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def delete_subscription(self, subscription: Subscription):
        self.db.delete(subscription)
        self.db.commit()