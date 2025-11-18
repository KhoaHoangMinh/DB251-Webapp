import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search } from 'lucide-react';
import EmployeeTable from './EmployeeTable';
import EmployeeDialog from './EmployeeDialog';

interface Employee {
  employeeId: string; // Matches EmployeeID in SQL
  employeeName: string; // Matches EmployeeName in SQL
  storeId: string; // Matches StoreID in SQL
  department: string;
  position: string;
  isActive: boolean; // Matches IsActive in SQL
  salary: number; // Matches Salary in SQL
}

// Mock employee data
const initialEmployees: Employee[] = [
  {
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    storeId: 'STO001',
    department: 'Engineering',
    position: 'Software Engineer',
    isActive: true,
    salary: 75000
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    storeId: 'STO002',
    department: 'Marketing',
    position: 'Marketing Manager',
    isActive: true,
    salary: 82000
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Michael Davis',
    storeId: 'STO003',
    department: 'Sales',
    position: 'Sales Representative',
    isActive: true,
    salary: 65000
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Emily Brown',
    storeId: 'STO004',
    department: 'Human Resources',
    position: 'HR Specialist',
    isActive: true,
    salary: 70000
  },
  {
    employeeId: 'EMP005',
    employeeName: 'David Wilson',
    storeId: 'STO001',
    department: 'Engineering',
    position: 'Senior Developer',
    isActive: true,
    salary: 95000
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
    setEmployees(employees.filter(emp => emp.employeeId !== id));
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => emp.employeeId === employee.employeeId ? employee : emp));
    } else {
      // Add new employee
      const newEmployee = {
        ...employee,
        employeeId: Date.now().toString()
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsDialogOpen(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.employeeId.toLowerCase().includes(searchLower) ||
      emp.employeeName.toLowerCase().includes(searchLower) ||
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
