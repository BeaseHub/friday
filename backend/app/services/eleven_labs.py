from sqlalchemy.orm import Session
from app.db.models import Conversation
from app.services.message_service import MessageService

class ElevenLabsService:
    def __init__(self, db: Session, message_service: MessageService):
        self.db = db
        self.message_service = message_service


    def import_transcript_as_conversation(self, user_id: int, transcript_list: list):
        # Step 1: Create a new conversation
        conversation = Conversation(user_id=user_id)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        # Step 2: Add each message
        for msg in transcript_list:

            if not msg.get("message") or not msg.get("role"):
                continue  # Skip empty messages

            self.message_service.create_message(
                user_id=user_id,
                content=msg['message'],
                is_systen=(msg['role'].lower() != 'user'),
                conversation_id=conversation.id
            )

        return conversation

    