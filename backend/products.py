from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel

from database import db_dependency
from models import Product

router = APIRouter(prefix="/products", tags=["Products"])

class ProductUpdate(BaseModel):
    productName: Optional[str] = None
    productDescription: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ProductCreate(BaseModel):
    productName: str
    productDescription: str
    price: Optional[float] = None
    stockQuantity: Optional[int] = None

class SummaryStats(BaseModel):
    total_products: int

@router.get("/")
def list_products(db: db_dependency):
    return db.query(Product).all()

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats(db: db_dependency) -> SummaryStats:
    total_products = db.query(Product).count()
    if total_products == 0:
        return SummaryStats(total_products=0)
    return SummaryStats(total_products=total_products)

def search_cond(a, b):
    return (a.lower() in b.productID.lower()
            or a.lower() in b.productName.lower()
            or a.lower() in b.productDescription.lower())
@router.get("/search")
def search_product(search: str, db: db_dependency):
    products = list(db.query(Product).all())
    products = [p for p in products if search_cond(search, p)]
    return products

@router.get("/{product_id}")
def view_product(product_id: str, db: db_dependency):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: db_dependency):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.post("/create_bulk", status_code=status.HTTP_201_CREATED)
def create_products(products: List[ProductCreate], db: db_dependency):
    created = []
    for product in products:
        created.append(create_product(product, db))
    return created

@router.put("/{product_id}")
def update_product(product_id: str, product_update: ProductUpdate, db: db_dependency):
    product = db.query(Product).filter(Product.productID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    if product_update.productName and product.productName != product_update.productName:
        product.productName = product_update.productName
    if product_update.productDescription and product.productDescription != product_update.productDescription:
        product.productDescription = product_update.productDescription
    if product_update.price and product.price != product_update.price:
        product.price = product_update.price
    if product_update.stock and product.stockQuantity != product_update.stock:
        product.stockQuantity = product_update.stock
    db.commit()
    db.refresh(product)
    return product

@router.delete("/")
def delete_bulk(indexes: List[str], db: db_dependency):
    for index in indexes:
        delete_product(index, db)
    return {"message" : "success"}

@router.delete("/{product_id}")
def delete_product(product_id: str, db: db_dependency):
    product = db.query(Product).filter(Product.productID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    db.delete(product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}

