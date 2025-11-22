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
    productID: str
    quantity: int
    unitPrice: float
    lineTotal: float

class OrderInfo(BaseModel):
    orderID: str
    customerID: str
    storeID: str
    dateOrder: datetime.datetime
    orderStatus: str
    itemList: List[ItemInfo]

class OrderSummary(BaseModel):
    orderID: str
    totalQuantity: int
    totalAmount: float

class ItemDetail(BaseModel):
    productName: str
    quantity: int
    unitPrice: float
    lineTotal: float
    orderStatus: str

class OrderDetails(BaseModel):
    orderID: str
    dateOrder: datetime.datetime
    customerName: str
    storeName: str
    itemList: List[ItemDetail]

@router.get('/')
def list_orders(db: db_dependency):
    return db.query(Orders).all()

@router.get('/{id}')
def view_order(id: str, db: db_dependency):
    order = db.query(Orders).filter(Orders.orderID == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = db.query(OrderItem).filter(OrderItem.orderID == id).all()
    item_list = [
        ItemInfo(
            productID=item.productID,
            quantity=item.quantity,
            unitPrice=item.unitPrice,
            lineTotal=item.lineTotal
        )
        for item in items
    ]
    return OrderInfo(orderID=order.orderID,
                    customerID=order.customerID,
                    storeID=order.storeID,
                    dateOrder=order.dateOrder,
                    orderStatus=order.orderStatus,
                    itemList=item_list
    )
@router.get('/order_summary/{id}')
def get_order_summary(id: str, db: db_dependency):
    try:
        query = text("SELECT * FROM dbo.GetOrderSummary(:id)")
        result = db.execute(query, {"id" : id}).fetchall()

        order_detail = []
        for row in result:
            order_detail.append(OrderSummary(
                orderID=row[0],
                totalQuantity=row[1],
                totalAmount=row[2],
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

@router.get('/details/{id}')
def get_order_detail(id: str, db: db_dependency):
    try:
        query = text("EXEC dbo.GetOrderProductDetails @OrderID=:id")
        result = db.execute(query, {"id" : id}).fetchall()

        item_detail = []
        for row in result:
            item_detail.append(ItemDetail(
                productName=row[4],
                quantity=row[5],
                unitPrice=row[6],
                lineTotal=row[7],
                orderStatus=row[8]
            ))

        order_detail = OrderDetails(
            orderID = result[0][0],
            dateOrder = result[0][1],
            customerName = result[0][2],
            storeName = result[0][3],
            itemList = item_detail
        )

        return order_detail
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calculate_estimated_delivery/{id}")
def calculate_estimated_delivery(id: str, db: db_dependency):
    try:
        query = text("SELECT dbo.CalculateEstimatedDelivery(:id)")
        result = db.execute(query, {"id" : id}).fetchall()

        return result[0][0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))