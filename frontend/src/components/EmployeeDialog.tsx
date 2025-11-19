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
  employeeName: string;
  storeID: string;
  department: string;
  position: string;
  isActive: boolean;
  salary: number;
}

interface EmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => void;
}

export default function EmployeeDialog({ employee, open, onOpenChange, onSave }: EmployeeDialogProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeName: '',
    storeID: '',
    department: '',
    position: '',
    salary: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        employeeName: '',
        storeID: '',
        department: '',
        position: '',
        salary: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [employee, open]);

  const handleChange = (field: keyof Employee, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: '',
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employeeName) newErrors.employeeName = 'Employee name is required.';
    if (!formData.storeID) newErrors.storeID = 'Store ID is required.';
    if (!formData.department) newErrors.department = 'Department is required.';
    if (!formData.position) newErrors.position = 'Position is required.';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Salary must be greater than 0.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData as Employee);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Update the employee details below.' : 'Fill in the details to add a new employee.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Employee Name */}
            <div className="col-span-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                placeholder="John Doe"
              />
              {errors.employeeName && <p className="text-red-500 text-sm">{errors.employeeName}</p>}
            </div>

            {/* Store ID */}
            <div className="col-span-2">
              <Label htmlFor="storeID">Store ID</Label>
              <Input
                id="storeID"
                value={formData.storeID}
                onChange={(e) => handleChange('storeID', e.target.value)}
                placeholder="STO001"
              />
              {errors.storeID && <p className="text-red-500 text-sm">{errors.storeID}</p>}
            </div>

            {/* Department */}
            <div className="col-span-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Engineering"
              />
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>

            {/* Position */}
            <div className="col-span-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Software Engineer"
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            {/* Salary */}
            <div className="col-span-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleChange('salary', parseFloat(e.target.value))}
                placeholder="75000"
              />
              {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
            </div>

            {/* Is Active */}
            <div className="col-span-2">
              <Label htmlFor="isActive">Active Status</Label>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onValueChange={(value) => handleChange('isActive', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{employee ? 'Update Employee' : 'Add Employee'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
