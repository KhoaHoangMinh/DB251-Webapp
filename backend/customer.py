from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Customer

router = APIRouter(prefix="/customers", tags=["Customers"])

class CustomersCreate(BaseModel):
    Age: int
    CustomerName: str
    Email: str
    DateOfBirth: str
    Phone: int
    IsActive: bool
    LoyaltyPoints: int

class SummaryStats(BaseModel):
    total_Customers: int
    avg_age: float

class CustomerUpdate(BaseModel):
    CustomerName: Optional[str] = None
    DateOfBirth: Optional[str] = None
    Phone: Optional[int] = None
    IsActive: Optional[bool] = None
    LoyaltyPoints: Optional[int] = None

@router.get("/")
def list_customers(db: db_dependency):
    return db.query(Customer).all()

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats(db : db_dependency) -> SummaryStats:
    total_customers = db.query(Customer).count()
    if total_customers == 0 :
        return SummaryStats(total_Customers = 0, avg_age=0)
    else :
        # TODO: convert this part to use SQL FUNCTION
        avg_age = round(db.query(func.sum(Customer.Age)).scalar() / total_customers, 1)
        return SummaryStats(total_Customers = total_customers, avg_age=avg_age)

@router.get("/{id}")
def view_customer(id: str, db : db_dependency):
    customer = db.query(Customer).get(id)
    if not customer:
        raise  HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_customer(new_customer: CustomersCreate, db: db_dependency):
    db_customer = Customer(**new_customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.post("/bulk", status_code = status.HTTP_201_CREATED)
def create_customers(customers: List[CustomersCreate], db : db_dependency):
    created = []
    for customer in customers:
        created.append(create_customer(customer, db))
    return created

@router.put("/{id}")
def update_customer(id: str, customer : CustomerUpdate, db : db_dependency):
    db_customer = db.query(Customer).filter(Customer.CustomerID == id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if customer.CustomerName: db_customer.CustomerName = customer.CustomerName
    if customer.DateOfBirth: db_customer.DateOfBirth = customer.DateOfBirth
    if customer.Phone: db_customer.Phone = customer.Phone
    if customer.IsActive is not None: db_customer.IsActive = customer.IsActive
    if customer.LoyaltyPoints: db_customer.LoyaltyPoints = customer.LoyaltyPoints
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/bulk", status_code=status.HTTP_200_OK)
def delete_bulk(indexes : List[str] = Body(...), db : Session = Depends(get_db)):
    for index in indexes:
        delete_customer(index, db)
    return {"message": "success"}

@router.delete("/{id}")
def delete_customer(id: str, db : db_dependency):
    db_customer = db.query(Customer).filter(Customer.CustomerID == id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": f"Customer {id} deleted successfully"}