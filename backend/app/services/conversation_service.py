from sqlalchemy.orm import Session
from app.db.models import Conversation

class ConversationService:
    def __init__(self, db: Session):
        self.db = db

    def get_conversations(self):
        return self.db.query(Conversation).all()
    
    def get_conversations_by_user(self, user_id: int):
        return self.db.query(Conversation).filter(Conversation.user_id == user_id).all()

    def get_conversation(self, conversation_id: int):
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def create_conversation(self, conversation_data: dict):
        conversation = Conversation(**conversation_data)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def update_conversation(self, conversation: Conversation, update_data: dict):
        for key, value in update_data.items():
            setattr(conversation, key, value)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation: Conversation):
        self.db.delete(conversation)
        self.db.commit()