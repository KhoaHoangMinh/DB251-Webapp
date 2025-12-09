from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import db_dependency
from models import Cart, CartItem
router = APIRouter(prefix='/cart', tags=['cart'])

class CartItemCreate(BaseModel):
    cartID: str
    productID: str
    quantity: int
    unitPrice: float

class ItemQuery(BaseModel):
    cartID: str
    productID: str

@router.get('/')
def get_cart_list(db: db_dependency):
    return db.query(Cart).all()

@router.get('/items')
def get_item_list(db: db_dependency):
    return db.query(CartItem).all()

@router.get('/{id}')
def get_customer_cart(id: str, db: db_dependency):
    cartID = db.query(Cart).filter(Cart.customerID == id).first().cartID
    return db.query(CartItem).filter(CartItem.cartID == cartID).all()

@router.post('/')
def add_to_cart(item: CartItemCreate, db: db_dependency):
    try:
        query = text("""
        EXEC dbo.AddCartItem
            @CartID = :cartID, 
            @ProductID = :productID, 
            @Quantity = :quantity, 
            @UnitPrice = :unitPrice
        """)

        params = {
            'cartID': item.cartID,
            'productID': item.productID,
            'quantity': item.quantity,
            'unitPrice': item.unitPrice
        }
        db.execute(query, params)
        db.commit()

        return "Add to cart successfully"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # db_item = CartItem(**item.model_dump())
    # db.add(db_item)
    # db.commit()
    # db.refresh(db_item)
    # return db_item

@router.delete('/')
def remove_from_cart(item_query: ItemQuery, db: db_dependency):
    try:
        query = text("EXEC dbo.DeleteCartItem @CartID = :cartID, @ProductID = :productID")
        params = {
            'cartID': item_query.cartID,
            'productID': item_query.productID
        }

        db.execute(query, params)
        db.commit()

        return "Removed from cart successfully"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/{qty}')
def update_qty(qty: int, item_query: ItemQuery, db: db_dependency):
    if qty <= 0:
        raise HTTPException(status_code=400, detail='Invalid quantity')
    cart_item = db.query(CartItem).filter(CartItem.cartID == item_query.cartID).filter(
        CartItem.productID == item_query.productID).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail='Cart item not found')
    try:
        query = text("""
        EXEC dbo.UpdateCartItem
            @CartID = :cartID, 
            @ProductID = :productID, 
            @Quantity = :quantity
        """)

        params = {
            'cartID' : item_query.cartID,
            'productID': item_query.productID,
            'quantity': qty
        }

        db.execute(query, params)
        db.commit()

        return "Update quantity successfully"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

