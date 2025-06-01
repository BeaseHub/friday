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
        return self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active"
        ).all()

    def get_subscription(self, subscription_id: int):
        return self.db.query(Subscription).filter(Subscription.id == subscription_id).first()

    def create_subscription(self, subscription_data: dict):
        subscription = Subscription(**subscription_data)
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def update_subscription(self, subscription: Subscription, update_data: dict):
        for key, value in update_data.items():
            setattr(subscription, key, value)
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def delete_subscription(self, subscription: Subscription):
        self.db.delete(subscription)
        self.db.commit()