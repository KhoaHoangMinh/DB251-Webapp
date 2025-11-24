from typing import Union, Annotated
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from products import router as product_router
from employees import router as employee_router
from customer import router as customer_router
from order import router as order_router
from stores import router as stores_router
from cart import router as cart_router

import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import pyodbc

""""
    create venv
    python3 -m venv venv
    source venv/bin/activate
"""

class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(product_router)
app.include_router(employee_router)
app.include_router(customer_router)
app.include_router(order_router)
app.include_router(stores_router)
app.include_router(cart_router)

# Mount static files
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve index.html at root
# @app.get("/")
# def read_root():
#     return FileResponse("static/index.html")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}


