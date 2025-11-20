from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Customer

router = APIRouter(prefix="/customers", tags=["Customers"])

class CustomersCreate(BaseModel):
    age: int
    customerName: str
    email: str
    dateOfBirth: str
    phone: int
    isActive: bool
    loyaltyPoints: int

class SummaryStats(BaseModel):
    total_Customers: int
    avg_age: float

class CustomerUpdate(BaseModel):
    customerName: Optional[str] = None
    dateOfBirth: Optional[str] = None
    phone: Optional[int] = None
    isActive: Optional[bool] = None
    loyaltyPoints: Optional[int] = None

class CustomerSpending(BaseModel):
    customerID: str
    customerName: str
    totalSpent: float

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
        avg_age = round(db.query(func.sum(Customer.age)).scalar() / total_customers, 1)
        return SummaryStats(total_Customers = total_customers, avg_age=avg_age)

def search_cond(a, b):
    return (a.lower() in b.customerID.lower()
            or a.lower() in b.customerName.lower()
            or a.lower() in b.email.lower()
            or a.lower() in b.phone.lower())
@router.get('/search')
def search_customer(search: str, db: db_dependency):
    customers = db.query(Customer).all()
    customers = [e for e in customers if search_cond(search, e)]
    return customers

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
    db_customer = db.query(Customer).filter(Customer.customerID == id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if customer.customerName: db_customer.customerName = customer.customerName
    if customer.dateOfBirth: db_customer.dateOfBirth = customer.dateOfBirth
    if customer.phone: db_customer.phone = customer.phone
    if customer.isActive: db_customer.isActive = customer.isActive
    if customer.loyaltyPoints: db_customer.loyaltyPoints = customer.loyaltyPoints
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
    db_customer = db.query(Customer).filter(Customer.customerID == id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": f"Customer {id} deleted successfully"}

@router.get("/total_spending/{id}", response_model=float)
def get_customer_total_spending(id: str, db : db_dependency):
    try:
        query = text("SELECT dbo.GetCustomerTotalSpending(:id)")
        result = db.execute(query, {"id": id}).scalar()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top_customers/{top}")
def get_top_customer(top: int, db : db_dependency):
    try:
        query = text("EXEC dbo.GetTopCustomers @TopN=:top")
        result = db.execute(query, {"top": top}).fetchall()

        top_customers = []
        for row in result:
            top_customers.append(CustomerSpending(
                customerID=row[0],
                customerName=row[1],
                totalSpent=row[2],
            ))

        return top_customers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))