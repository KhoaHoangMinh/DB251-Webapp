import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

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

interface EmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => void;
}

const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'];
const positions = {
  Engineering: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Engineering Manager'],
  Marketing: ['Marketing Manager', 'Content Specialist', 'Digital Marketing Specialist'],
  Sales: ['Sales Representative', 'Sales Manager', 'Account Executive'],
  'Human Resources': ['HR Specialist', 'HR Manager', 'Recruiter'],
  Finance: ['Accountant', 'Financial Analyst', 'Finance Manager'],
  Operations: ['Operations Manager', 'Operations Coordinator', 'Project Manager']
};

export default function EmployeeDialog({ employee, open, onOpenChange, onSave }: EmployeeDialogProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: 0,
    hireDate: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setAvailablePositions(positions[employee.department as keyof typeof positions] || []);
    } else {
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: 0,
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      setAvailablePositions([]);
    }
    setErrors({});
  }, [employee, open]);

  const handleDepartmentChange = (department: string) => {
    setFormData({
      ...formData,
      department,
      position: '' // Reset position when department changes
    });
    setAvailablePositions(positions[department as keyof typeof positions] || []);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Employee ID validation
    if (!formData.employeeId?.trim()) {
      newErrors.employeeId = 'Employee ID is required.';
    } else if (!/^EMP\d{3,}$/.test(formData.employeeId)) {
      newErrors.employeeId = 'Employee ID must be in format EMP### (e.g., EMP001).';
    }

    // First Name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required.';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long.';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters and spaces.';
    }

    // Last Name validation
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required.';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long.';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters and spaces.';
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@company.com).';
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be in format ###-#### (e.g., 555-0101).';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Department is required. Please select a department.';
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = 'Position is required. Please select a position.';
    }

    // Salary validation
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Salary must be greater than zero.';
    } else if (formData.salary < 30000) {
      newErrors.salary = 'Salary must be at least $30,000.';
    } else if (formData.salary > 500000) {
      newErrors.salary = 'Salary cannot exceed $500,000.';
    }

    // Hire Date validation
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required.';
    } else {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();
      const minDate = new Date('2000-01-01');
      
      if (hireDate > today) {
        newErrors.hireDate = 'Hire date cannot be in the future.';
      } else if (hireDate < minDate) {
        newErrors.hireDate = 'Hire date must be after January 1, 2000.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData as Employee);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            {employee 
              ? 'Update the employee information below. All fields are required.'
              : 'Enter the employee information below. All fields are required.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Employee ID */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="employeeId">
                Employee ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeId"
                placeholder="EMP001"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
              />
              {errors.employeeId && (
                <p className="text-sm text-red-600 mt-1">{errors.employeeId}</p>
              )}
            </div>

            {/* Status */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Name */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Smith"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@company.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="555-0101"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Department */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-600 mt-1">{errors.department}</p>
              )}
            </div>

            {/* Position */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="position">
                Position <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleChange('position', value)}
                disabled={!formData.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {availablePositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-600 mt-1">{errors.position}</p>
              )}
            </div>

            {/* Salary */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="salary">
                Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                placeholder="75000"
                value={formData.salary || ''}
                onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
              />
              {errors.salary && (
                <p className="text-sm text-red-600 mt-1">{errors.salary}</p>
              )}
            </div>

            {/* Hire Date */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="hireDate">
                Hire Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleChange('hireDate', e.target.value)}
              />
              {errors.hireDate && (
                <p className="text-sm text-red-600 mt-1">{errors.hireDate}</p>
              )}
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Please correct the errors above before submitting the form.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
