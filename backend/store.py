from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix='/store', tags=["Store"])

class Store(BaseModel):
    id: int
    name: str
    phone: int
    address: str
    opening_hours: str