from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel

from database import db_dependency
from models import Product

router = APIRouter(prefix="/products", tags=["Products"])

class ProductUpdate(BaseModel):
    ProductName: Optional[str] = None
    ProductDescription: Optional[str] = None
    Price: Optional[float] = None
    Stock: Optional[int] = None

class ProductCreate(BaseModel):
    ProductName: str
    ProductDescription: str
    Price: Optional[float] = None
    StockQuantity: Optional[int] = None

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
    return a.lower() in b.ProductName.lower() or a.lower() in b.ProductDescription.lower()
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
    new_product = Product(**product.dict())
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
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    if product_update.ProductName: product.ProductName = product_update.ProductName
    if product_update.ProductDescription: product.ProductDescription = product_update.ProductDescription
    if product_update.ProductPrice: product.ProductPrice = product_update.ProductPrice
    if product_update.ProductStock: product.ProductStock = product_update.ProductStock
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
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    db.delete(product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}


