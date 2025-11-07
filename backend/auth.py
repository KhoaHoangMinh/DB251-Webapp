import jwt
from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from fastapi.security import HTTPBasic, HTTPBearer
from pydantic import BaseModel, ValidationError
from typing import Union, Any
from datetime import datetime, timedelta, timezone



SECURITY_ALGORITHM = 'HS256'
SECRET_KEY = '123456'
reusable_oauth2 = HTTPBearer(scheme_name='Authorization')

router = APIRouter(prefix="/auth", tags=["Authentication"])

user_db = {"admin" : "password"}

class LoginForm(BaseModel):
    username: str
    password: str

def generate_token(username: Union[str, Any]) -> str:
    expire = datetime.utcnow() + timedelta(minutes=2)
    to_encode = {"exp": expire, "username": username}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=SECURITY_ALGORITHM)
    return encoded_jwt

def validate_token(http_authorization_credentials=Depends(reusable_oauth2)) -> str:
    try:
        payload = jwt.decode(http_authorization_credentials.credentials, SECRET_KEY, algorithms=[SECURITY_ALGORITHM])
        exp = payload.get('exp')
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Token expired")
        return payload.get('username')
    except(jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=403,
            detail=f"Could not validate credentials",
        )


def verify_password(credentials: LoginForm):
    password = user_db.get(credentials.username)
    return password and credentials.password == password

@router.post('/')
def login(request: LoginForm):
    if verify_password(request):
        token = generate_token(request.username)
        return {"token" : token}
    else:
        raise HTTPException(status_code=401, detail="Incorrect username / password")

@router.get('/info', dependencies=[Depends(validate_token)])
def get_info():
    return {"message" : "success"}