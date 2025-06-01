from sqlalchemy.orm import Session
from app.db.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_users(self):
            return self.db.query(User).all()
    
    def get_active_users(self):
        return self.db.query(User).filter(User.is_active == True).all()

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, email: str, password: str, **kwargs):
        hashed_password = pwd_context.hash(password)
        user = User(email=email, password_hash=hashed_password, **kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if not user or not pwd_context.verify(password, user.password_hash):
            return None
        return user

    def change_password(self, user: User, new_password: str):
        user.password_hash = pwd_context.hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_profile(self, user: User, **kwargs):
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user