import datetime

from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel
from sqlalchemy import text

from models import Product
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

class OrderSummary(BaseModel):
    OrderID: str
    TotalQuantity: int
    TotalAmount: float

class ItemDetail(BaseModel):
    ProductName: str
    Quantity: int
    UnitPrice: float
    LineTotal: float
    OrderStatus: str

class OrderDetails(BaseModel):
    OrderID: str
    DateOrder: datetime.datetime
    CustomerName: str
    StoreName: str
    ItemList: List[ItemDetail]

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
@router.get('/order_summary/{id}')
def get_order_summary(id: str, db: db_dependency):
    try:
        query = text("SELECT * FROM dbo.GetOrderSummary(:id)")
        result = db.execute(query, {"id" : id}).fetchall()

        order_detail = []
        for row in result:
            order_detail.append(OrderSummary(
                OrderID=row[0],
                TotalQuantity=row[1],
                TotalAmount=row[2],
            ))

        return order_detail
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/{id}')
def update_stock_after_order(id: str, db: db_dependency):
    try:
        query = text("EXEC dbo.UpdateStockAfterOrder @OrderID=:id")
        db.execute(query, {"id" : id})
        db.commit()

        return {"message": "Stock updated successfully for Order: " + id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/order_detail/{id}')
def get_order_detail(id: str, db: db_dependency):
    try:
        query = text("EXEC dbo.GetOrderProductDetails @OrderID=:id")
        result = db.execute(query, {"id" : id}).fetchall()

        item_detail = []
        for row in result:
            item_detail.append(ItemDetail(
                ProductName=row[4],
                Quantity=row[5],
                UnitPrice=row[6],
                LineTotal=row[7],
                OrderStatus=row[8]
            ))

        order_detail = OrderDetails(
            OrderID = result[0][0],
            DateOrder = result[0][1],
            CustomerName = result[0][2],
            StoreName = result[0][3],
            ItemList = item_detail
        )

        return order_detail
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))