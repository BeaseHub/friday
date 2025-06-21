from fastapi import APIRouter, Depends, HTTPException, status,  UploadFile, File, Form
from sqlalchemy.orm import Session
from app.services.user_service import UserService
from app.db.database import get_db
from app.schemas.user import UserCreate, User, UserUpdate, ChangePassword
from jose import jwt, JWTError
from datetime import timedelta, datetime
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import Body

import os
from uuid import uuid4

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    service = UserService(db)
    user = service.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

@router.get("/users", response_model=list[User])
def get_users(db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_users()

@router.get("/users/active", response_model=list[User])
def get_active_users(db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_active_users()

@router.get("/users/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/signup", response_model=User)
async def signup(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone_number: str = Form(None),
    profile_picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    db_user = service.get_user_by_email(email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    profile_picture_path = None
    if profile_picture:
        filename = f"{uuid4()}_{profile_picture.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await profile_picture.read())
        profile_picture_path = f"uploads/{filename}"
    return service.create_user(
        email,
        password,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        profile_picture_path=profile_picture_path,
        type="user"
    )
@router.post("/admin/create-user", response_model=User)
async def create_user_admin(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone_number: str = Form(None),
    profile_picture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Only admins can access
):
    service = UserService(db)
    db_user = service.get_user_by_email(email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Only allow if current user is an admin
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    profile_picture_path = None
    if profile_picture:
        filename = f"{uuid4()}_{profile_picture.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await profile_picture.read())
        profile_picture_path = f"uploads/{filename}"
    return service.create_user(
        email,
        password,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        profile_picture_path=profile_picture_path,
        type="admin"
    )
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token_data = {"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer","user": user}

# Logout is handled on the frontend by deleting the JWT token

@router.post("/change-password")
def change_password(
    change: ChangePassword,
    email: str = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    # If admin and email is provided, change that user's password
    if current_user.type == "admin" and email:
        user = service.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        service.change_password(user, change.new_password)
        return {"msg": f"Password updated for {email}"}
    else:
        user = service.get_user_by_email(current_user.email)
        if not user or not service.authenticate_user(current_user.email, change.old_password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        service.change_password(current_user, change.new_password)
        return {"msg": "Password updated"}

@router.patch("/update-profile", response_model=User)
async def update_profile(
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone_number: str = Form(None),
    profile_picture: UploadFile = File(None),
    is_active: bool = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    user = service.get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = {}
    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    if phone_number is not None:
        update_data["phone_number"] = phone_number
    if is_active is not None:
        update_data["is_active"] = is_active
    if profile_picture:
        filename = f"{uuid4()}_{profile_picture.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            f.write(await profile_picture.read())
        update_data["profile_picture_path"] = f"uploads/{filename}"
    return service.update_profile(user, **update_data)