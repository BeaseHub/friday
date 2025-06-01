from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.conversation import Conversation, ConversationCreate, ConversationUpdate
from app.services.conversation_service import ConversationService
from app.schemas.user import User
from app.db.database import get_db

from app.api.auth import get_current_user  # Import the dependency to get the current user

router = APIRouter()

@router.get("/conversations", response_model=list[Conversation])
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = ConversationService(db)
    return service.get_conversations()
@router.get("/users/{user_id}/conversations", response_model=list[Conversation])
def get_conversations_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these conversations")
    service = ConversationService(db)
    return service.get_conversations_by_user(user_id)

@router.get("/users/{user_id}/conversations/{conversation_id}", response_model=Conversation)
def get_conversation(
    user_id: int,
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if (conversation.user_id != current_user.id and current_user.type != "admin") or conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    return conversation

@router.post("/conversations", response_model=Conversation)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ConversationService(db)
    # Ensure the conversation is created for the current user
    data = conversation.dict()
    data["user_id"] = current_user.id
    return service.create_conversation(data)

@router.put("/conversations/{conversation_id}", response_model=Conversation)
def update_conversation(
    conversation_id: int,
    conversation_update: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this conversation")
    return service.update_conversation(conversation, conversation_update.dict(exclude_unset=True))

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")
    service.delete_conversation(conversation)
    return {"detail": "Conversation deleted"}