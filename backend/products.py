from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List, Annotated
from pydantic import BaseModel
from sqlalchemy import text

from database import db_dependency
from models import Product

router = APIRouter(prefix="/products", tags=["Products"])

class ProductUpdate(BaseModel):
    productName: Optional[str] = None
    productDescription: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    isActive: Optional[bool] = None

class ProductCreate(BaseModel):
    productName: str
    productDescription: str
    price: Optional[float] = None
    stockQuantity: Optional[int] = None

class SummaryStats(BaseModel):
    total_products: int

class BestSellingProduct(BaseModel):
    productID: str
    productName: str
    totalQuantitySold: int

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
    try:
        query = text("""
        EXEC dbo.CreateNewProduct
            @ProductName = :productName,
            @ProductDescription = :productDescription,
            @Price = :productPrice,
            @StockQuantity = :stockQuantity
        """)
        params = {
            'productName' : product.productName,
            'productDescription' : product.productDescription,
            'productPrice' : product.price,
            'stockQuantity' : product.stockQuantity
        }
        db.execute(query, params)
        db.commit()

        return "Product created successfully"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # new_product = Product(**product.model_dump())
    # db.add(new_product)
    # db.commit()
    # db.refresh(new_product)
    # return new_product

@router.post("/create_bulk", status_code=status.HTTP_201_CREATED)
def create_products(products: List[ProductCreate], db: db_dependency):
    created = []
    for product in products:
        created.append(create_product(product, db))
    return created

@router.put("/{product_id}")
def update_product(product_id: str, product_update: ProductUpdate, db: db_dependency):
    try:
        query = text("""
        EXEC dbo.UpdateProductDetails 
            @ProductID = :productID, 
            @ProductName = :productName, 
            @ProductDescription = :productDescription, 
            @Price = :price, 
            @StockQuantity = :stockQuantity, 
            @IsActive = :isActive
        """)

        params = {
            'productID' : product_id,
            'productName' : product_update.productName,
            'productDescription' : product_update.productDescription,
            'price' : product_update.price,
            'stockQuantity' : product_update.stock,
            'isActive' : product_update.isActive,
        }

        db.execute(query, params)
        db.commit()

        return "Product updated successfully"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/")
def delete_bulk(indexes: List[str], db: db_dependency):
    for index in indexes:
        delete_product(index, db)
    return {"message" : "success"}

@router.delete("/{product_id}")
def delete_product(product_id: str, db: db_dependency):
    try:
        query = text("EXEC dbo.DeleteProductPermanently @ProductID = :productID")

        db.execute(query, {'productID' : product_id})
        db.commit()

        return "Product deleted successfully"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_top_selling_products/{top}")
def get_top_selling_products(top: int, db: db_dependency):
    try:
        query = text("EXEC dbo.GetTopSellingProductsByQuantity @TopN=:top")
        result = db.execute(query, {"top": top}).fetchall()

        top_products = []
        for row in result:
            top_products.append(BestSellingProduct(
                productID=row[0],
                productName=row[1],
                totalQuantitySold=row[2]
            ))

        return top_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
