from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func, text
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

@router.get('/get_avr_price/{id}', response_model=float)
def get_average_price(id: str, db: db_dependency):
    try:
        query = text("SELECT dbo.GetAveragePriceByStore(:id)")
        result = db.execute(query, {"id" : id}).scalar()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))