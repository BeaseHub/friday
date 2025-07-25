# from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import home, agent, plan, conversation, message, subscription, payment, auth, eleven_labs  # Import all routers
# from app.api import auth  # Uncomment if you have an auth router
import uvicorn
from fastapi.staticfiles import StaticFiles
import os
from fastapi import FastAPI

app = FastAPI()

os.makedirs("uploads/messages", exist_ok=True)
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
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
app.include_router(eleven_labs.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Web Application!"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
