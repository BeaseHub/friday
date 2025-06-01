from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import home, agent, plan, conversation, message, subscription, payment, auth  # Import all routers
# from app.api import auth  # Uncomment if you have an auth router
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home.router)
app.include_router(agent.router)
app.include_router(plan.router)
app.include_router(conversation.router)
app.include_router(message.router)
app.include_router(subscription.router)
app.include_router(payment.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Web Application!"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

# To run the application, you can use the command:
# python main.py

# To run the application via uvicorn, use the command:
# uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload