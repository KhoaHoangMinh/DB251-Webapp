from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Employee

router = APIRouter(prefix="/employees", tags=["Employees"])

class EmployeesCreate(BaseModel):
    EmployeeName: str
    StoreID: str
    Department: str
    Position : str
    Salary: float

class SummaryStats(BaseModel):
    total_employees: int
    total_positions: int
    total_departments: int
    avg_salary: float

class EmployeeUpdate(BaseModel):
    Department: Optional[str] = None
    Position: Optional[str] = None
    Salary: Optional[float] = None


@router.get("/")
def list_employees(db: db_dependency):
    return db.query(Employee).all()

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats(db : db_dependency) -> SummaryStats:
    total_employees = db.query(Employee).count()
    if total_employees == 0 :
        return SummaryStats(total_employees = 0, total_positions = 0, total_departments = 0, avg_salary=0)
    else :
        # TODO: convert this part to use SQL FUNCTION
        total_positions = db.query(Employee.Position).distinct().count()
        total_departments = db.query(Employee.Department).distinct().count()
        total_salary = db.query(func.sum(Employee.Salary)).scalar()
        avg_salary = round(total_salary / total_employees, 2)
        return SummaryStats(total_employees = total_employees, total_positions = total_positions,
                            total_departments = total_departments, avg_salary=avg_salary)

@router.get("/{id}")
def view_employee(id: str, db : db_dependency):
    employee = db.query(Employee).get(id)
    if not employee:
        raise  HTTPException(status_code=404, detail="employee not found")
    return employee

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(new_employee: EmployeesCreate, db: db_dependency):
    db_employee = Employee(**new_employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.post("/bulk", status_code = status.HTTP_201_CREATED)
def create_employees(employees: List[EmployeesCreate], db : db_dependency):
    created = []
    for employee in employees:
        created.append(create_employee(employee, db))
    return created

@router.put("/{id}")
def update_employee(id: str, employee : EmployeeUpdate, db : db_dependency):
    db_employee = db.query(Employee).filter(Employee.EmployeeID == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if employee.Position: db_employee.Position = employee.Position
    if employee.Department: db_employee.Department = employee.Department
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/bulk", status_code=status.HTTP_200_OK)
def delete_bulk(indexes : List[str] = Body(...), db : Session = Depends(get_db)):
    for index in indexes:
        delete_employee(index, db)
    return {"message": "success"}

@router.delete("/{id}")
def delete_employee(id: str, db : db_dependency):
    db_employee = db.query(Employee).filter(Employee.EmployeeID == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": f"Employee {id} deleted successfully"}

