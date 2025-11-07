from fastapi import APIRouter, HTTPException, status, Body
from typing import Optional, Dict, List, Type
from pydantic import BaseModel

router = APIRouter(prefix="/employees", tags=["Employees"])

class Employee(BaseModel):
    id: int
    name: str
    email: str
    phone: str

class EmployeeSearch(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[int] = None

class Employees_Create(BaseModel):
    name: str
    email: str
    phone: str

class SummaryStats(BaseModel):
    total_name: int
    total_phone: int
    total_email: int

class Employee_Update(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

employee_db = {
    1: Employee(id=1, name="Khoa Nguyen", email="khoa.nguyen@example.com", phone="12345678"),
    2: Employee(id=2, name="John Smith", email="john.smith@example.com", phone="12345678"),
    3: Employee(id=3, name="Duc Tran", email="duc.tran@example.com", phone="12345678"),
    4: Employee(id=4, name="Alice Johnson", email="alice.johnson@example.com", phone="87654321"),
    5: Employee(id=5, name="Bob Smith", email="bob.smith@example.com", phone="98765432"),
    6: Employee(id=6, name="Charlie Nguyen", email="charlie.nguyen@example.com", phone="56789012"),
    7: Employee(id=7, name="David Brown", email="david.brown@example.com", phone="43210987"),
    8: Employee(id=8, name="Emma Tran", email="emma.tran@example.com", phone="24681357"),
    9: Employee(id=9, name="Sophia Johnson", email="sophia.johnson@example.com", phone="13572468"),
    10: Employee(id=10, name="Liam Wilson", email="liam.wilson@example.com", phone="11223344"),
    11: Employee(id=11, name="Olivia Brown", email="olivia.brown@example.com", phone="22334455"),
    12: Employee(id=12, name="Noah Miller", email="noah.miller@example.com", phone="33445566"),
    13: Employee(id=13, name="Ava Nguyen", email="ava.nguyen@example.com", phone="44556677"),
    14: Employee(id=14, name="James Wilson", email="james.wilson@example.com", phone="55667788"),
    15: Employee(id=15, name="Mia Tran", email="mia.tran@example.com", phone="66778899"),
}
next_id = 16

@router.get("/", response_model=List[Employee])
def list_employees() -> List[Employee]:
    return list(employee_db.values())

@router.get("/stats", response_model=SummaryStats)
def get_summary_stats() -> SummaryStats:
    total_employees = len(employee_db)
    if total_employees == 0 :
        return SummaryStats(total_name = 0, total_email = 0, total_phone = 0)
    else :
        return SummaryStats(total_name = total_employees, total_email = total_employees, total_phone = total_employees)

@router.get('/search', response_model=List[Employee])
def search_employee(query: EmployeeSearch) -> List[Employee]:
    results = list(employee_db.values())
    if query.name:
        results = [e for e in results if query.name.lower() in e.name.lower()]
    elif query.email:
        results = [e for e in results if query.email.lower() in e.email.lower()]
    elif query.phone:
        results = [e for e in results if query.phone == e.phone]
    return results

@router.get("/{employee_id}", response_model=Employee)
def view_employee(employee_id: int) -> Employee:
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

@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee: Employees_Create) -> Employee:
    global next_id

    # if len(employee.phone) != 10 or employee.phone[0] != '0':
    #     raise HTTPException(status_code=400, detail="Invalid phone number")
    #
    # if "@gmail.com" not in employee.email:
    #     raise HTTPException(status_code=400, detail="Invalid email")

    new_employee = Employee(
        id=next_id,
        name=employee.name,
        email=employee.email,
        phone=employee.phone
    )

    employee_db[next_id] = new_employee
    next_id += 1
    return new_employee

@router.post("/create_bulk", response_model = List[Employee], status_code = status.HTTP_201_CREATED)
def create_employees(employees: List[Employees_Create]) -> List[Employee]:
    created = []
    for employee in employees:
        created.append(create_employee(employee))
    return created

@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee : Employee_Update, employee_id: int) -> Employee:
    new_employee = employee_db.get(employee_id)
    if not new_employee:
        raise HTTPException(status_code=404, detail="employee not found")
    if employee.name: new_employee.name = employee.name
    if employee.email: new_employee.email = employee.email
    if employee.phone: new_employee.phone = employee.phone
    return new_employee

@router.delete("/", status_code=status.HTTP_200_OK)
def delete_bulk(indexes : List[int] = Body(...)):
    for index in indexes:
        if index not in employee_db:
            raise HTTPException(status_code=404, detail="employee not found")
        delete_employee(index)
    return {"message": f"Deleted {len(indexes)} employees successfully"}

@router.delete("/{employee_id}")
def delete_employee(employee_id: int):
    employee = employee_db.get(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="employee not found")
    employee_db.pop(employee_id)
    return {"message": f"Employee {employee_id} deleted successfully"}

