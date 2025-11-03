from http.client import HTTPException

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
from typing import Annotated

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBasic()

users_db = {
    "admin": {
        "username": "admin",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "password": "password",
        "disabled": False,
    },
    "alice": {
        "username": "alice",
        "full_name": "Alice Wonderson",
        "email": "alice@example.com",
        "password": "secret2",
        "disabled": True,
    },
}

def verify_user(credentials: Annotated[HTTPBasicCredentials, Depends(security)],):
    user = users_db.get(credentials.username)
    if not user or not secrets.compare_digest(user["password"], credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

@router.get("/users/me")
def read_current_user(credentials: Annotated[HTTPBasicCredentials, Depends(security)]):
    return verify_user(credentials)
    return {"username": credentials.username, "password": credentials.password}

@router.post("/login")
def login(user: dict = Depends(verify_user)):
    return {
        "message": f"Welcome, {user['full_name']}!",
        "username": user["username"],
        "email": user["email"],
    }

@router.post("/logout")
def logout():
    return {"message": "Logout successful."}

@router.get("/auth/status")
def foo3(user: dict = Depends(verify_user)):
    return {
        "username": user["username"],
        "full_name": user["full_name"],
        "email": user["email"],
    }
