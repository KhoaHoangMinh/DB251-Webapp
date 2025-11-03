from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict
from pydantic import BaseModel

router = APIRouter(prefix="/employees", tags=["Employees"])

class Employee(BaseModel):
    id: int
    name: str
    email: str
    phone: str

class Employees_Create(BaseModel):
    name: str
    email: str
    phone: str

employee_db = {
    1 : Employee(id=1, name="khoa", email="khoa@example.com", phone="12345678"),
    2 : Employee(id=2, name="john", email="john@example.com", phone="12345678"),
    3 : Employee(id=3, name="duc", email="duc@example.com", phone="12345678"),
}
next_id = 3

@router.get("/")
def list_employees():
    return list(employee_db.values())

@router.get("/{empoyee_id}")
def view_employee(employee_id: int):
    employee = employee_db.get(employee_id)
    if not employee:
        raise  HTTPException(status_code=404, detail="employee not found")
    return employee

# @router.post("/", status_code=status.HTTP_201_CREATED)
# def create_employee(id: int, name: str, email: str, phone: int):
#     global next_id
#     if id < 0 or phone < 0:
#         raise HTTPException(status_code=400, detail="Invalid id or phone number")
#     new_employee = Employee(id=id, name=name, email=email, phone=phone)
#     employee_db[next_id] = new_employee
#     next_id += 1
#     return new_employee

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(employee: Employees_Create):
    global next_id
    if len(employee.phone) != 10 or employee.phone[0] != '0':
        raise HTTPException(status_code=400, detail="Invalid phone number")
    print("DEBUG:", employee.email)
    if "@gmail.com" not in employee.email:
        raise HTTPException(status_code=400, detail="Invalid email")

    new_employee = Employee(
        id=next_id,
        name=employee.name,
        email=employee.email,
        phone=employee.phone
    )

    employee_db[next_id] = new_employee
    next_id += 1
    return new_employee

@router.put("/{employee_id}")
def update_employee(employee_id: int,
                    name: Optional[str] = None,
                    email: Optional[str] = None,
                    phone: Optional[str] = None):
    employee = employee_db.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if name: employee.name = name
    if email: employee.email = email
    if phone: employee.phone = phone
    return employee

@router.put("/")
def update_employee(employee_id: int,
                    name: Optional[str] = None,
                    email: Optional[str] = None,
                    phone: Optional[str] = None):
    employee = employee_db.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if name: employee.name = name
    if email: employee.email = email
    if phone: employee.phone = phone
    return employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int):
    employee = employee_db.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="employee not found")
    employee_db.pop(employee_id)
    return employee_db
