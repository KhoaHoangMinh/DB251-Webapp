import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search, RefreshCcw} from 'lucide-react';
import EmployeeTable from './EmployeeTable';
import EmployeeDialog from './EmployeeDialog';

interface Employee {
  employeeID: string;
  employeeName: string;
  storeId: string;
  department: string;
  position: string;
  isActive: boolean;
  salary: number; // Matches Salary in SQL
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8000/employees'); // Adjust URL if needed
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const searchEmployees = async (term: string) => {
    try {
      const response = await fetch(`http://localhost:8000/employees/search?search=${encodeURIComponent(term)}`); // Adjust URL if needed
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchEmployees();
    } else {
      searchEmployees(searchTerm);
    }
  }, [searchTerm]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/employees/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
    fetchEmployees();
  };

  const handleSaveEmployee = async (employee: Employee) => {
    if (selectedEmployee) {
      // Update existing employee
      try {
        const response = await fetch(`http://localhost:8000/employees/${employee.employeeID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employee),
        });

        if (!response.ok) {
          throw new Error('Failed to update employee');
        }

        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => emp.employeeID === updatedEmployee.employeeID ? updatedEmployee : emp));
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    } else {
      // Add new employee
      try {
        const response = await fetch('http://localhost:8000/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employee),
        });

        if (!response.ok) {
          throw new Error('Failed to create employee');
        }

        const newEmployee = await response.json();
        setEmployees([...employees, newEmployee]);
      } catch (error) {
        console.error('Error creating employee:', error);
      }
    }
    setIsDialogOpen(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.employeeID.toLowerCase().includes(searchLower) ||
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
          <div className="flex gap-4">
            <Button onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
            <Button onClick={fetchEmployees}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by ID, name, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
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
