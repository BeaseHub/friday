from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.agent import Agent, AgentCreate, AgentUpdate
from typing import Optional
from app.services.agent_service import AgentService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user
from fastapi import File, UploadFile, Form
import os
import json
from uuid import uuid4

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.get("/agents", response_model=list[Agent])
def get_agents(db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.get_agents()

@router.get("/agents/active", response_model=list[Agent])
def get_active_agents(db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.get_active_agents()
    

@router.get("/agents/{agent_id}", response_model=Agent)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    service = AgentService(db)
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/agents", response_model=Agent)
async def create_agent(
    name: str = Form(...),
    price: float = Form(...),
    description: Optional[str] = Form(None),
    feature_list: Optional[str] = Form(None),  # Accept as JSON string if needed
    is_active: Optional[bool] = Form(True),
    image: UploadFile = File(None),
    eleven_labs_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # if current_user.type != "admin":
    #     raise HTTPException(status_code=403, detail="Admin privileges required")
    agent_data = {
        "name": name,
        "price": price,
        "description": description,
        "is_active": is_active,
        "eleven_labs_id": eleven_labs_id,
    }
    # Handle feature_list if provided as JSON string
    if feature_list:
        agent_data["feature_list"] = json.loads(feature_list)



    # Handle image upload
    if image:
        UPLOAD_DIR = "uploads/plans"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f_out:
            f_out.write(await image.read())
        agent_data["image_path"]  = f"{UPLOAD_DIR}/{filename}"

    service = AgentService(db)
    return service.create_agent(agent_data)


@router.put("/agents/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: int,
    eleven_labs_id: Optional[str] = Form(None),
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    feature_list: Optional[str] = Form(None),  # Accept as JSON string if needed
    is_active: Optional[bool] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = AgentService(db)
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent_update = {}
    if name is not None:
        agent_update["name"] = name
    if price is not None:
        agent_update["price"] = price
    if description is not None:
        agent_update["description"] = description
    if is_active is not None:
        agent_update["is_active"] = is_active
    if feature_list:
        agent_update["feature_list"] = json.loads(feature_list)
    if eleven_labs_id is not None:
        agent_update["eleven_labs_id"] = eleven_labs_id
    if image:
        UPLOAD_DIR = "uploads/plans"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await image.read())
        agent_update["image_path"] = f"{UPLOAD_DIR}/{filename}"
    return service.update_agent(agent, agent_update)

        

@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = AgentService(db)
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    service.delete_agent(agent)
    return {"detail": "Agent deleted"}