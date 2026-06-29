from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.db import models
from app.core import security

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    new_user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(new_user)
    db.flush()  # Extract user ID for relationships

    # Create associated profile
    new_profile = models.Profile(
        user_id=new_user.id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
    )
    db.add(new_profile)

    # Create default notification settings
    new_notifications = models.NotificationSettings(
        user_id=new_user.id
    )
    db.add(new_notifications)
    
    db.commit()
    return {"message": "User registered successfully", "email": new_user.email}

@router.post("/token", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = security.create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}
