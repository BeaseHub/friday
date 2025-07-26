from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.schemas.plan import Plan, PlanCreate, PlanUpdate
from app.services.plan_service import PlanService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

import os
from uuid import uuid4
import json

router = APIRouter()

@router.get("/plans", response_model=list[Plan])
def get_plans(db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.get_plans()

@router.get("/plans/active", response_model=list[Plan])
def get_active_plans(db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.get_active_plans()

@router.get("/plans/{plan_id}", response_model=Plan)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    service = PlanService(db)
    plan = service.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/plans", response_model=Plan)
async def create_plan(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(None),
    feature_list: str = Form(None),  # Accept as JSON string if needed
    max_agents: int = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    image_path = None
    if image:
        UPLOAD_DIR = "uploads/plans"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await image.read())
        image_path = f"{UPLOAD_DIR}/{filename}"
    # Parse feature_list if sent as JSON string
    import json
    features = json.loads(feature_list) if feature_list else None
    plan_data = {
        "name": name,
        "description": description,
        "price": price,
        "feature_list": features,
        "max_agents": max_agents,
        "is_active": is_active,
        "image_path": image_path
    }
    service = PlanService(db)
    return service.create_plan(plan_data)

@router.put("/plans/{plan_id}", response_model=Plan)
async def update_plan(
    plan_id: int,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    feature_list: str = Form(None),  # Accept as JSON string if needed
    max_agents: int = Form(None),
    is_active: bool = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = PlanService(db)
    plan = service.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    image_path = plan.image_path
    if image:
        import os
        from uuid import uuid4
        UPLOAD_DIR = "uploads/plans"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await image.read())
        image_path = f"{UPLOAD_DIR}/{filename}"

    features = json.loads(feature_list) if feature_list else None
    update_data = {
        "name": name,
        "description": description,
        "price": price,
        "feature_list": features,
        "max_agents": max_agents,
        "is_active": is_active,
        "image_path": image_path
    }
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    return service.update_plan(plan, update_data)
@router.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = PlanService(db)
    plan = service.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    service.delete_plan(plan)
    return {"detail": "Plan deleted"}