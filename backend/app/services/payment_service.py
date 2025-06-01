from sqlalchemy.orm import Session
from app.db.models import Payment, Subscription

class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get_payments(self):
        return self.db.query(Payment).all()
    
    def get_payments_by_user(self, user_id: int):
        return self.db.query(Payment).filter(Payment.user_id == user_id).all()

    def get_payment(self, payment_id: int):
        return self.db.query(Payment).filter(Payment.id == payment_id).first()

    def get_payments_by_subscription(self, subscription_id: int):
        return self.db.query(Payment).filter(Payment.subscription_id == subscription_id).all()

    def create_payment(self, payment_data: dict):
        subscription_id = payment_data.get("subscription_id")
        user_id = payment_data.get("user_id")
        plan_id = payment_data.get("plan_id")  # You may need to pass this in the payment_data

        # Check if subscription exists
        subscription = None
        if subscription_id:
            subscription = self.db.query(Subscription).filter(Subscription.id == subscription_id).first()

        # If not, create a new subscription
        if not subscription:
            if not user_id or not plan_id:
                raise ValueError("user_id and plan_id are required to create a subscription.")
            subscription = Subscription(
                user_id=user_id,
                plan_id=plan_id,
                status="active"
            )
            self.db.add(subscription)
            self.db.commit()
            self.db.refresh(subscription)
            payment_data["subscription_id"] = subscription.id
        else:
            # If subscription exists, activate it
            subscription.status = "active"
            self.db.add(subscription)
            self.db.commit()

        # Remove plan_id before creating Payment
        payment_data.pop("plan_id", None)

        # Now create the payment
        payment = Payment(**payment_data)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def update_payment(self, payment: Payment, update_data: dict):
        for key, value in update_data.items():
            setattr(payment, key, value)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def delete_payment(self, payment: Payment):
        self.db.delete(payment)
        self.db.commit()