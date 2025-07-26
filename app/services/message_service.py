from sqlalchemy.orm import Session
from app.db.models import Message, Conversation

class MessageService:
    def __init__(self, db: Session):
        self.db = db

    def get_messages(self):
        return self.db.query(Message).all()

    def get_message(self, message_id: int):
        return self.db.query(Message).filter(Message.id == message_id).first()
    
    def get_messages_by_conversation(self, conversation_id: int):
        return self.db.query(Message).filter(Message.conversation_id == conversation_id).all()

    def create_message(self, user_id: int, content: str, is_systen: bool = False, file_path: str = None, conversation_id: int = None):
        # If conversation_id is not provided, create a new conversation
        if conversation_id is None:
            conversation = Conversation(user_id=user_id)
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
            conversation_id = conversation.id

        # Now create the message
        message = Message(
            conversation_id=conversation_id,
            is_systen=is_systen,
            content=content,
            file_path=file_path
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def update_message(self, message: Message, update_data: dict):
        for key, value in update_data.items():
            setattr(message, key, value)
        self.db.commit()
        self.db.refresh(message)
        return message

    def delete_message(self, message: Message):
        self.db.delete(message)
        self.db.commit()