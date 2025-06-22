from sqlalchemy import Column, Table, Integer, String, Boolean, Text, Numeric, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy.sql import func
import enum

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, default="user", nullable=False)  # "user" or "admin"
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    profile_picture_path = Column(String(255))
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# Association table for Subscription <-> Agent
subscription_agents = Table(
    "subscription_agents",
    Base.metadata,
    Column("subscription_id", Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), primary_key=True),
    Column("agent_id", Integer, ForeignKey("agents.id", ondelete="CASCADE"), primary_key=True)
)

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    feature_list = Column(JSON)
    is_active = Column(Boolean, default=True)
    image_path = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


    subscriptions = relationship(
        "Subscription",
        secondary=subscription_agents,
        back_populates="agents"
    )


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)  # NULL if free plan
    feature_list = Column(JSON)  # Stores array of features
    max_agents = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    image_path = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())



class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", backref="conversations", passive_deletes=True)
    messages = relationship("Message", backref="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    is_systen = Column(Boolean, nullable=False, default=False)  # True if system, False if user
    content = Column(Text, nullable=False)
    file_path = Column(String(255), nullable=True)  # Can be null
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

class SubscriptionStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    cancelled = "cancelled"
    expired = "expired"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expire_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.active, nullable=False)

    user = relationship("User", backref="subscriptions", passive_deletes=True)
    plan = relationship("Plan", backref="subscriptions")
    payments = relationship("Payment", back_populates="subscription", cascade="all, delete-orphan")

    # Add this relationship:
    agents = relationship(
        "Agent",
        secondary=subscription_agents,
        back_populates="subscriptions"
    )

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False)
    payment_type = Column(String(50), nullable=False)  # e.g., "credit_card", "paypal"
    currency = Column(String(10), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_id = Column(String(255), nullable=False)
    paid_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="payments", passive_deletes=True)
    subscription = relationship("Subscription", back_populates="payments", passive_deletes=True)