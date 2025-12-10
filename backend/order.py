import datetime

from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from models import Product
from database import db_dependency, get_db
from models import Orders, OrderItem, Cart, CartItem
from cart import remove_from_cart, ItemQuery

router = APIRouter(prefix='/orders', tags=["Orders"])

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

class OrderCreate(BaseModel):
    customerID: str
    storeID: str
    orderStatus: str

class OrderUpdate(BaseModel):
    customerID: Optional[str] = None
    storeID: Optional[str] = None
    orderStatus: Optional[str] = None

class OrderItemCreate(BaseModel):
    orderID: str
    productID: str
    quantity: int
    unitPrice: float

@router.get('/')
def list_orders(db: db_dependency):
    return db.query(Orders).all()

def search_cond(a, b):
    return (a.lower() in b.orderID.lower()
            or a.lower() in b.customerID.lower()
            or a.lower() in b.storeID.lower()
            or a.lower() in b.orderStatus.lower())
@router.get('/search')
def search_order(search: str, db: db_dependency):
    orders = db.query(Orders).all()
    orders = [e for e in orders if search_cond(search, e)]
    return orders

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

def create_order_item(item_create: OrderItemCreate, db: db_dependency):
    db_item = OrderItem(**item_create.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def create_order_items(cartID: str, orderID: str, db: db_dependency):
    items = db.query(CartItem).filter(CartItem.cartID == cartID).all()
    for item in items:
        create_order_item(OrderItemCreate(orderID=orderID, productID=item.productID, quantity=item.quantity, unitPrice=item.unitPrice), db)
        db.delete(item)
    db.commit()
    return

def create_order_helper(new_order: OrderCreate, db: db_dependency):
    insert_query = text("""
                INSERT INTO Orders (customerID, storeID, orderStatus)
                VALUES (:customerID, :storeID, :orderStatus)
            """)

    db.execute(insert_query, {
        'customerID': new_order.customerID,
        'storeID': new_order.storeID,
        'orderStatus': new_order.orderStatus,
    })
    db.commit()

    latest_order = db.query(Orders).order_by(Orders.orderID.desc()).first()
    db.refresh(latest_order)
    return latest_order

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_order(new_order: OrderCreate, db: db_dependency):
    cartID = db.query(Cart).filter(Cart.customerID == new_order.customerID).first().cartID
    if not db.query(CartItem).filter(CartItem.cartID == cartID).all():
        raise HTTPException(status_code=400, detail='Cart is empty')
    created_order = create_order_helper(new_order, db)
    create_order_items(cartID, created_order.orderID, db)
    update_stock_after_order(created_order.orderID, db)
    return {"message" : "success"}

@router.delete("/{id}")
def delete_order(id: str, db: db_dependency):
    db_order = db.query(Orders).filter(Orders.orderID == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="order not found")
    try:
        db.delete(db_order)
        db.commit()
        return {"message": f"Order {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bulk", status_code=status.HTTP_200_OK)
def delete_orders(indexes : List[str] = Body(...), db : Session = Depends(get_db)):
    for index in indexes:
        delete_order(index, db)
    return {"message": "success"}

@router.put("/{id}", status_code=status.HTTP_200_OK)
def order_update(id: str, order: OrderUpdate, db: db_dependency):
    db_order = db.query(Orders).filter(Orders.orderID == id).first()

    if not db_order:
        raise HTTPException(status_code=404, detail="order not found")

    try:
        if order.orderStatus and db_order.orderStatus != order.orderStatus:
            db_order.orderStatus = order.orderStatus
        if order.customerID and db_order.customerID != order.customerID:
            db_order.customerID = order.customerID
        if order.storeID and db_order.storeID != order.storeID:
            db_order.storeID = order.storeID

        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
