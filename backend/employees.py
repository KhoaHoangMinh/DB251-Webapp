from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, db_dependency
from models import Employee

router = APIRouter(prefix="/employees", tags=["Employees"])

class EmployeesCreate(BaseModel):
    employeeName: str
    storeID: str
    department: str
    position : str
    salary: float

class SummaryStats(BaseModel):
    total_employees: int
    total_positions: int
    total_departments: int
    avg_salary: float

class EmployeeUpdate(BaseModel):
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None


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
        total_positions = db.query(Employee.position).distinct().count()
        total_departments = db.query(Employee.department).distinct().count()
        total_salary = db.query(func.sum(Employee.salary)).scalar()
        avg_salary = round(total_salary / total_employees, 2)
        return SummaryStats(total_employees = total_employees, total_positions = total_positions,
                            total_departments = total_departments, avg_salary=avg_salary)

def search_cond(a, b):
    return (a.lower() in b.employeeName.lower()
            or a.lower() in b.employeeID.lower()
            or a.lower() in b.storeID.lower()
            or a.lower() in b.department.lower()
            or a.lower() in b.position.lower())
@router.get('/search')
def search_employee(search: str, db: db_dependency):
    employees = db.query(Employee).all()
    employees = [e for e in employees if search_cond(search, e)]
    return employees

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
    db_employee = db.query(Employee).filter(Employee.employeeID == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if employee.position and db_employee.position != employee.position:
        db_employee.position = employee.position
    if employee.department and db_employee.department != employee.department:
        db_employee.department = employee.department
    if employee.salary and db_employee.salary != employee.salary:
        db_employee.salary = employee.salary
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
    db_employee = db.query(Employee).filter(Employee.employeeID == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": f"Employee {id} deleted successfully"}

