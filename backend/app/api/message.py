from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.schemas.message import Message, MessageCreate, MessageUpdate
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

from uuid import uuid4
import os

router = APIRouter()

@router.get("/conversations/{conversation_id}/messages", response_model=list[Message])
def get_messages_for_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check conversation ownership
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation or (conversation.user_id != current_user.id and current_user.type != "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to access these messages")
    service = MessageService(db)
    return service.get_messages_by_conversation(conversation_id)

@router.get("/messages/{message_id}", response_model=Message)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MessageService(db)
    message = service.get_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    # Check conversation ownership
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(message.conversation_id)
    if not conversation or (conversation.user_id != current_user.id and current_user.type != "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to access this message")
    return message

@router.post("/messages", response_model=Message)
async def create_message(
    content: str = Form(...),
    conversation_id: int = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add messages to this conversation")

    file_path = None
    if file:
        UPLOAD_DIR = "uploads/messages"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid4()}_{file.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f_out:
            f_out.write(await file.read())
        file_path = f"{UPLOAD_DIR}/{filename}"

    service = MessageService(db)
    return service.create_message(
        user_id=current_user.id,
        content=content,
        is_systen=False,  # or Form(...) if you want to allow setting this
        file_path=file_path,
        conversation_id=conversation_id
    )

@router.put("/messages/{message_id}", response_model=Message)
def update_message(
    message_id: int,
    message_update: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MessageService(db)
    message = service.get_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    # Check conversation ownership
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(message.conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this message")
    return service.update_message(message, message_update.dict(exclude_unset=True))

@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MessageService(db)
    message = service.get_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    # Check conversation ownership
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(message.conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    service.delete_message(message)
    return {"detail": "Message deleted"}