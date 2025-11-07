from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, List

from fastapi.params import Query
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["Products"])

class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stock: int

class ProductSearch(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class ProductUpdate(BaseModel):
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
    1: Product(id=1, name="Macbook", category="Electronics", price=1200.0, stock=15),
    2: Product(id=2, name="Smartphone", category="Electronics", price=800.0, stock=30),
    3: Product(id=3, name="Desk Chair", category="Furniture", price=150.0, stock=10),
    4: Product(id=4, name="Gaming Laptop", category="Electronics", price=1800.0, stock=8),
    5: Product(id=5, name="Wireless Mouse", category="Electronics", price=25.0, stock=100),
    6: Product(id=6, name="Bluetooth Headphones", category="Electronics", price=150.0, stock=25),
    7: Product(id=7, name="LED TV", category="Electronics", price=500.0, stock=20),
    8: Product(id=8, name="Dining Table", category="Furniture", price=350.0, stock=5),
    9: Product(id=9, name="Bookshelf", category="Furniture", price=120.0, stock=12),
    10: Product(id=10, name="Electric Kettle", category="Home Appliances", price=30.0, stock=50),
    11: Product(id=11, name="Blender", category="Home Appliances", price=70.0, stock=40),
    12: Product(id=12, name="Microwave", category="Home Appliances", price=100.0, stock=15),
    13: Product(id=13, name="Coffee Maker", category="Home Appliances", price=90.0, stock=18),
    14: Product(id=14, name="Refrigerator", category="Home Appliances", price=600.0, stock=10),
    15: Product(id=15, name="Office Desk", category="Furniture", price=200.0, stock=7),
}
next_id = 16

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

@router.get("/search", response_model=List[Product])
def search_product(query: ProductSearch) -> List[Product]:
    results = list(product_db.values())
    if query.name:
        results = [p for p in results if query.name.lower() in p.name.lower()]
    elif query.category:
        results = [p for p in results if query.category.lower() in p.category.lower()]
    return results

@router.get("/{product_id}", response_model=Product)
def view_product(product_id: int) -> List[Product]:
    product = product_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/create", response_model=Product, status_code=status.HTTP_201_CREATED)
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
def update_product(product_update: ProductUpdate, product_id: int) -> Product:
    product = product_db.get(product_id)
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


