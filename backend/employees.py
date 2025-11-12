from fastapi import APIRouter, HTTPException, status, Body, Depends
from typing import Optional, List, Annotated
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, engine, get_db, db_dependency
from models import Employee

router = APIRouter(prefix="/employees", tags=["Employees"])

class Employees_Create(BaseModel):
    StoreID: int
    Department: str
    Position : str

class SummaryStats(BaseModel):
    total_employees: int
    total_positions: int
    total_departments: int

class Employee_Update(BaseModel):
    EmployeeID: int
    Department: Optional[str] = None
    Position: Optional[str] = None


@router.get("/")
def list_employees(db: db_dependency):
    return db.query(Employee).all()

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats(db : db_dependency) -> SummaryStats:
    total_employees = db.query(Employee).count()
    if total_employees == 0 :
        return SummaryStats(total_employees = 0, total_positions = 0, total_departments = 0)
    else :
        total_positions = db.query(Employee.Position).distinct().count()
        total_departments = db.query(Employee.Department).distinct().count()
        return SummaryStats(total_employees = total_employees, total_positions = total_positions, total_departments = total_departments)

@router.get("/{employee_id}")
def view_employee(employee_id: int, db : db_dependency):
    employee = db.query(Employee).get(employee_id)
    if not employee:
        raise  HTTPException(status_code=404, detail="employee not found")
    return employee

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(new_employee: Employees_Create, db: db_dependency):
    db_employee = Employee(**new_employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

# TODO: add create_employees()
@router.post("/create_bulk", response_model = List[Employees_Create], status_code = status.HTTP_201_CREATED)
def create_employees(employees: List[Employees_Create], db : db_dependency) -> List[Employees_Create]:
    created = []
    for employee in employees:
        created.append(employee)
        db_employee = Employee(**employee.dict())
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
    return created

@router.put("/")
def update_employee(employee : Employee_Update, db : db_dependency):
    # TODO: modify to receive object as parameter
    db_employee = db.query(Employee).filter(Employee.EmployeeID == employee.EmployeeID).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if employee.Position is not None:
        db_employee.Position = employee.Position
    if employee.Department is not None:
        db_employee.Department = employee.Department

    db.commit()
    db.refresh(db_employee)
    return db_employee

# TODO: add delete bulk
@router.delete("/delete_bulk", status_code=status.HTTP_200_OK)
def delete_bulk(indexes : List[int] = Body(...), db : Session = Depends(get_db)):
    if not indexes:
        raise HTTPException(status_code=404, detail="No employee IDs provided")

    #Find all employees that exist
    existing_employees = db.query(Employee).filter(
        Employee.EmployeeID.in_(indexes)
    ).all()

    existing_ids = [emp.EmployeeID for emp in existing_employees]
    non_existing_id = set(indexes) - set(existing_ids)

    if non_existing_id:
        raise HTTPException(status_code=404, detail=f"Employee not found: {list(non_existing_id)}")

    # Delete all in one transaction
    deleted_count = db.query(Employee).filter(Employee.EmployeeID.in_(indexes)).delete(synchronize_session=False)
    db.commit()

    return {
        "message": f"Deleted {deleted_count} employees successfully",
        "deleted_ids": indexes
    }

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db : db_dependency):
    db_employee = db.query(Employee).filter(Employee.EmployeeID == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": f"Employee {employee_id} deleted successfully"}

