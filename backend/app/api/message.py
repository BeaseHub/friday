from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.schemas.message import Message, MessageCreate, MessageUpdate
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

from app.socket_manager import sio  # Import the SocketManager instance
from typing import Optional
from uuid import uuid4
from app.schemas.message import Message as MessageSchema
import os
import httpx

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
    conversation_id: Optional[int] = Form(None),  # Now optional
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If conversation_id is provided, check ownership
    if conversation_id is not None:
        conversation_service = ConversationService(db)
        conversation = conversation_service.get_conversation(conversation_id)
        if not conversation or conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to add messages to this conversation")
    else:
        conversation = None  # Or handle as needed

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
    message = service.create_message(
        user_id=current_user.id,
        content=content,
        is_systen=False,  # or Form(...) if you want to allow setting this
        file_path=file_path,
        conversation_id=conversation_id
    )
    # message_dict = MessageSchema.from_orm(message).dict(exclude={"conversation"})
    # await sio.emit('new_message', message_dict, room=f"conversation_{conversation_id}")
    
    # Wait for thse system response to be generated
    await system_response(
        user_message=content,
        conversation_id=conversation_id,
        db=db,
        sio=sio
    )

    return message

# Example system_response function
async def system_response(user_message: str, conversation_id: int, db: Session, sio):
    """
    Calls n8n to get a system response, saves it as a message, and emits it.
    """

    # Call your n8n webhook or API to get the system response
    async with httpx.AsyncClient(timeout=20.0) as client:
        n8n_response = await client.post(
            "https://n8n.srv793731.hstgr.cloud/webhook/friday",
            json={"message": user_message}
        )

        print("n8n status code:", n8n_response.status_code)
        print("n8n response text:", n8n_response.text)

        system_content = n8n_response.text
        # try:
        #     n8n_data = n8n_response.json()
        #     system_content = n8n_data.get("response", "No response from system.")
        # except Exception as e:
        #     system_content = f"System error: {str(e)} | n8n said: {n8n_response.text}"


    # Save the system message
    service = MessageService(db)
    system_message = service.create_message(
        user_id=None,  # or a system user id
        content=system_content,
        is_systen=True,
        file_path=None,
        conversation_id=conversation_id
    )

    print(f"System response saved: {system_content}")

    # system_message_dict = MessageSchema.from_orm(system_message).dict(exclude={"conversation"})
    # await sio.emit('new_message', system_message_dict, room=f"conversation_{conversation_id}")

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