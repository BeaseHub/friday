from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.plan import Plan, PlanCreate, PlanUpdate
from app.services.plan_service import PlanService
from app.db.database import get_db
from app.schemas.user import User  # Import User schema if needed for authentication
from app.api.auth import get_current_user  # Import the dependency to get the current user

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
def create_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = PlanService(db)
    return service.create_plan(plan.dict())

@router.put("/plans/{plan_id}", response_model=Plan)
def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    service = PlanService(db)
    plan = service.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return service.update_plan(plan, plan_update.dict(exclude_unset=True))

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