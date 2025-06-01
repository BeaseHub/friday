from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def read_home():
    return {"message": "Welcome to the FastAPI Web Application!"}

@router.get("/about")
async def read_about():
    return {"message": "This is the home page of the FastAPI Web Application."}