from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func, text
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
    isActive: Optional[bool] = None

@router.get("/")
def list_employees(db: db_dependency):
    return db.query(Employee).all()

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats(db : db_dependency) -> SummaryStats:
    try:
        query = text("SELECT * FROM dbo.GetSummaryStatsForEmployee()")
        result = db.execute(query).fetchone()

        return SummaryStats(
            total_employees=result.total_employees,
            total_positions=result.total_positions,
            total_departments=result.total_departments,
            avg_salary=float(result.avg_salary) if result.avg_salary else 0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    try:
        if employee.position and db_employee.position != employee.position:
            db_employee.position = employee.position
        if employee.department and db_employee.department != employee.department:
            db_employee.department = employee.department
        if employee.salary and db_employee.salary != employee.salary:
            db_employee.salary = employee.salary
        if employee.isActive != None:
            db_employee.isActive = employee.isActive
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    try:
        db.delete(db_employee)
        db.commit()
        return {"message": f"Employee {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
