from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Employee

router = APIRouter(prefix="/employees", tags=["Employees"])

class Employees_Create(BaseModel):
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

class Employee_Update(BaseModel):
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
        return SummaryStats(total_employees = 0, total_positions = 0, total_departments = 0, total_salary = 0)
    else :
        # TODO: convert this part to use SQL FUNCTION
        total_positions = db.query(Employee.Position).distinct().count()
        total_departments = db.query(Employee.Department).distinct().count()
        total_salary = db.query(func.sum(Employee.Salary)).scalar()
        avg_salary = round(total_salary / total_employees, 2)
        return SummaryStats(total_employees = total_employees, total_positions = total_positions,
                            total_departments = total_departments, avg_salary=avg_salary)

@router.get("/{employee_id}")
def view_employee(employee_id: str, db : db_dependency):
    employee = db.query(Employee).get(employee_id)
    if not employee:
        raise  HTTPException(status_code=404, detail="employee not found")
    return employee

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(new_employee: Employees_Create, db: db_dependency):
    db_employee = Employee(**new_employee.model_dump())
    # TODO: fix the conflict between models.py and CREATE.sql
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.post("/create_bulk", status_code = status.HTTP_201_CREATED)
def create_employees(employees: List[Employees_Create], db : db_dependency):
    created = []
    for employee in employees:
        created.append(create_employee(employee, db))
    return created

@router.put("/{employee_id}")
def update_employee(employee_id: str, employee : Employee_Update, db : db_dependency):
    db_employee = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if employee.Position: db_employee.Position = employee.Position
    if employee.Department: db_employee.Department = employee.Department
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/delete_bulk", status_code=status.HTTP_200_OK)
def delete_bulk(indexes : List[str] = Body(...), db : Session = Depends(get_db)):
    for index in indexes:
        delete_employee(index, db)
    return {"message": "success"}

@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db : db_dependency):
    db_employee = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": f"Employee {employee_id} deleted successfully"}

