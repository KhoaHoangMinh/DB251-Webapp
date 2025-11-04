from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["Products"])

class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stock: int

class ProductUpdate(BaseModel):
    id: int
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock: int

class StockUpdate(BaseModel):
    stock: int

class SummaryStats(BaseModel):
    total_products: int
    total_stock: int
    avg_price: float

product_db: Dict[int, Product] = {
    1 : Product(id=1, name="Macbook", category="Electronics", price=1200.0, stock=15),
    2 : Product(id=2, name="Smartphone", category="Electronics", price=800.0, stock=30),
    3 : Product(id=3, name="Desk Chair", category="Furniture", price=150.0, stock=10),
}
next_id = 4

@router.get("/", response_model=List[Product])
def list_products() -> List[Product]:
    return list(product_db.values())

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats() -> SummaryStats:
    total_products = len(product_db)
    if total_products == 0:
        return SummaryStats(total_products=0, total_stocks=0, avg_price=0.0)
    total_stock = sum(product.stock for product in product_db.values())
    avg_price = round(sum(product.price for product in product_db.values())/total_products, 2)
    return SummaryStats(total_products=total_products, total_stock=total_stock, avg_price=avg_price)

@router.get("/{product_id}", response_model=Product)
def view_product(product_id: int) -> List[Product]:
    product = product_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# TODO: Add APIs supporting query parameters

@router.post("/create",response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate) -> Product:
    global next_id
    new_product = Product(id= next_id, **product.dict())
    product_db[next_id] = new_product
    next_id += 1
    return new_product

@router.post("/create_bulk", response_model=List[Product], status_code=status.HTTP_201_CREATED)
def create_products(products: List[ProductCreate]) -> List[Product]:
    created = []
    for product in products:
        created.append(create_product(product))
    return created

@router.put("/{product_id}", response_model=Product)
def update_product(product_update: ProductUpdate) -> Product:
    product = product_db.get(product_update.id)
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    if product_update.name: product.name = product_update.name
    if product_update.category: product.category = product_update.category
    if product_update.price: product.price = product_update.price
    if product_update.stock: product.stock = product_update.stock
    return product

@router.patch("/{product_id}/stock", response_model=Product)
def update_qty(product_id: int, stock_update: StockUpdate) -> Product:
    product = product_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product ID")
    if stock_update.stock < 0:
        raise HTTPException(status_code=400, detail="Negative stock qty")
    product.stock = stock_update.stock
    product_db[product_id] = product
    return product

@router.delete("/")
def delete_bulk(indexes: List[int]):
    for index in indexes:
        delete_product(index)
    return {"message" : "success"}

@router.delete("/{product_id}")
def delete_product(product_id: int):
    if not product_db.get(product_id):
        raise HTTPException(status_code=404, detail="Invalid product ID")
    product_db.pop(product_id)
    return {"message": f"Product {product_id} deleted successfully"}


