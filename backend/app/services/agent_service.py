from sqlalchemy.orm import Session
from app.db.models import Agent

class AgentService:
    def __init__(self, db: Session):
        self.db = db

    def get_agents(self):
        return self.db.query(Agent).all()
    
    def get_active_agents(self):
        return self.db.query(Agent).filter(Agent.is_active == True).all()

    def get_agent(self, agent_id: int):
        return self.db.query(Agent).filter(Agent.id == agent_id).first()

    def create_agent(self, agent_data: dict):
        agent = Agent(**agent_data)
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def update_agent(self, agent: Agent, update_data: dict):
        for key, value in update_data.items():
            setattr(agent, key, value)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def delete_agent(self, agent: Agent):
        self.db.delete(agent)
        self.db.commit()