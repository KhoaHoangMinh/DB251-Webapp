import datetime

from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel

from database import db_dependency
from models import Orders, OrderItem

router = APIRouter(prefix='/order', tags=["Order"])

class ItemInfo(BaseModel):
    ProductID: str
    Quantity: int
    UnitPrice: float
    LineTotal: float

class OrderInfo(BaseModel):
    OrderID: str
    CustomerID: str
    StoreID: str
    DateOrder: datetime.datetime
    OrderStatus: str
    ItemList: List[ItemInfo]

@router.get('/')
def list_orders(db: db_dependency):
    return db.query(Orders).all()

@router.get('/{id}')
def view_order(id: str, db: db_dependency):
    order = db.query(Orders).filter(Orders.OrderID == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = db.query(OrderItem).filter(OrderItem.OrderID == id).all()
    item_list = [
        ItemInfo(
            ProductID=item.ProductID,
            Quantity=item.Quantity,
            UnitPrice=item.UnitPrice,
            LineTotal=item.LineTotal
        )
        for item in items
    ]
    return OrderInfo(OrderID=order.OrderID,
                    CustomerID=order.CustomerID,
                    StoreID=order.StoreID,
                    DateOrder=order.DateOrder,
                    OrderStatus=order.OrderStatus,
                    ItemList=item_list
    )
