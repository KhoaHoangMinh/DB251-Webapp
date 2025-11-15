from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Store

router = APIRouter(prefix='/stores', tags=['Stores'])

@router.get('/')
def list_stores(db: db_dependency):
    return db.query(Store).all()

def search_cond(a, b):
    return (a.lower() in b.StoreName.lower() or
            a.lower() in b.StoreAddress.lower())

@router.get('/search')
def search_store(search: str, db: db_dependency):
    stores = list(db.query(Store).all())
    stores = [store for store in stores if search_cond(search, store)]
    return stores