import json
from fastapi import FastAPI, Request, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic import BaseModel
import hmac
import hashlib
import time
import os
from fastapi import APIRouter
from app.websocket_manager import ws_manager    # Import the WebSocket manager
from app.services.eleven_labs import ElevenLabsService
from app.db.database import get_db

router = APIRouter()
# Load environment variables
from dotenv import load_dotenv  

WEBHOOK_SECRET = os.getenv("ELEVENLABS_WEBHOOK_SECRET")

class WebhookPayload(BaseModel):
    event: str
    data: dict


@router.post("/webhook/eleven")
async def receive_webhook(request: Request,db: Session = Depends(get_db)):
    print("Received webhook request for elevenlab")

    raw = await request.body()
    sig_header = request.headers.get("elevenlabs-signature")
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing signature")

    try:
        timestamp = sig_header.split(",")[0][2:]
        hmac_signature = sig_header.split(",")[1]
    except:
        raise HTTPException(status_code=400, detail="Invalid signature format")

    # Check for replay attack (30-minute tolerance)
    if int(timestamp) < (int(time.time()) - 30 * 60):
        raise HTTPException(status_code=400, detail="Stale webhook")

    full_payload = f"{timestamp}.{raw.decode('utf-8')}"
    computed_hmac = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        full_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    expected_sig = f"v0={computed_hmac}"

    if hmac_signature != expected_sig:
        raise HTTPException(status_code=401, detail="Invalid signature")



    # Now process the payload
    payload = raw.decode("utf-8")
    json_payload = json.loads(payload)

    data = json_payload.get("data", {})

    # print(f"Received data: {data}")



    # ✅ Extract relevant values
    # user_name = data.get("conversation_initiation_client_data", {}) \
    #                 .get("dynamic_variables", {}) \
    #                 .get("user_name")
    
    user_id = data.get("conversation_initiation_client_data", {}) \
                    .get("dynamic_variables", {}) \
                    .get("user_id")
    
    agent_id = data.get("agent_id")

    conversation_id = data.get("conversation_id")
    transcript_list = data.get("transcript", [])  # List of messages with important field such as role and message
    transcript_summary = data.get("analysis", {}).get("transcript_summary")
    call_status = data.get("status")
    call_success = data.get("analysis", {}).get("call_successful")
    start_time = data.get("metadata", {}).get("start_time_unix_secs")
    call_duration = data.get("metadata", {}).get("call_duration_secs")
    cost = data.get("metadata", {}).get("cost")

    # Optionally format transcript
    full_transcript = "\n".join([f"{msg['role'].upper()}: {msg['message']}" for msg in transcript_list])

    # ✅ Example: Print or store
    print(f"User ID: {user_id}, Conv ID: {conversation_id}")
    print(f"Summary: {transcript_summary}")
    print(f"Transcript:\n{full_transcript}")

    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    elevenlabs_service = ElevenLabsService(db=db)  # Replace with actual DB session and service

    conversation_created= elevenlabs_service.import_transcript_as_conversation(
        user_id=user_id,  # Replace with actual user ID if available
        transcript_list=transcript_list
    )

    room_name = f"user_{user_id}_conversations"
    print("[WS] Emitting user message")
    # print(conversation_created)

    # Step 3: Notify via WebSocket
    # await ws_manager.broadcast(
    #     room=room_name,
    #     message=json.dumps(conversation_created)
    # )
    
    await ws_manager.broadcast(
        room=room_name,
        message=json.dumps({"event": "new_conversation"})
    )

# Add the router to the main FastAPI app
