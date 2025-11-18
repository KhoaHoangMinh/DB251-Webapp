import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search } from 'lucide-react';
import EmployeeTable from './EmployeeTable';
import EmployeeDialog from './EmployeeDialog';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: 'Active' | 'Inactive';
}

// Mock employee data
const initialEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '555-0101',
    department: 'Engineering',
    position: 'Software Engineer',
    salary: 75000,
    hireDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '555-0102',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 82000,
    hireDate: '2022-06-20',
    status: 'Active'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@company.com',
    phone: '555-0103',
    department: 'Sales',
    position: 'Sales Representative',
    salary: 65000,
    hireDate: '2023-03-10',
    status: 'Active'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@company.com',
    phone: '555-0104',
    department: 'Human Resources',
    position: 'HR Specialist',
    salary: 70000,
    hireDate: '2022-11-05',
    status: 'Active'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    phone: '555-0105',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 95000,
    hireDate: '2021-08-12',
    status: 'Active'
  }
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => emp.id === employee.id ? employee : emp));
    } else {
      // Add new employee
      const newEmployee = {
        ...employee,
        id: Date.now().toString()
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsDialogOpen(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.employeeId.toLowerCase().includes(searchLower) ||
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower) ||
      emp.position.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-gray-900">Employee Directory</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage employee information and records
            </p>
          </div>
          <Button onClick={handleAddEmployee}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by ID, name, email, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Table */}
      <EmployeeTable
        employees={filteredEmployees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Employee Dialog */}
      <EmployeeDialog
        employee={selectedEmployee}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
