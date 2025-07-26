from sqlalchemy.orm import Session
from app.db.models import Plan

class PlanService:
    def __init__(self, db: Session):
        self.db = db

    def get_plans(self):
        return self.db.query(Plan).all()
    
    def get_active_plans(self):
        return self.db.query(Plan).filter(Plan.is_active == True).all()

    def get_plan(self, plan_id: int):
        return self.db.query(Plan).filter(Plan.id == plan_id).first()

    def create_plan(self, plan_data: dict):
        plan = Plan(**plan_data)
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def update_plan(self, plan: Plan, update_data: dict):
        for key, value in update_data.items():
            setattr(plan, key, value)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def delete_plan(self, plan: Plan):
        self.db.delete(plan)
        self.db.commit()