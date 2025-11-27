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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Customer {
  age: number;
  customerName: string;
  email: string;
  dateOfBirth: string;
  phone: number;
  isActive: boolean;
  loyaltyPoints: number;
}

interface CustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Customer) => void;
}

export default function CustomerDialog({ customer, open, onOpenChange, onSave }: CustomerDialogProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    age: 0,
    customerName: '',
    email: '',
    dateOfBirth: '',
    phone: 0,
    isActive: true,
    loyaltyPoints: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        age: 0,
        customerName: '',
        email: '',
        dateOfBirth: '',
        phone: 0,
        isActive: true,
        loyaltyPoints: 0,
      });
    }
    setErrors({});
  }, [customer, open]);

  const handleChange = (field: keyof Customer, value: string | number | boolean) => {
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
    if (!formData.customerName) newErrors.customerName = 'Customer name is required.';
    if (!formData.age || formData.age <= 0) newErrors.age = 'Age must be greater than 0.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';
    if (!formData.phone || formData.phone <= 0) newErrors.phone = 'Phone number is required.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData as Customer);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Update the customer details below.' : 'Fill in the details to add a new customer.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Customer Name */}
            <div className="col-span-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="John Doe"
              />
              {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                placeholder="30"
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', parseInt(e.target.value))}
                placeholder="1234567890"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            {/* Loyalty Points */}
            <div>
              <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
              <Input
                id="loyaltyPoints"
                type="number"
                value={formData.loyaltyPoints}
                onChange={(e) => handleChange('loyaltyPoints', parseInt(e.target.value))}
                placeholder="0"
              />
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
            <Button type="submit">{customer ? 'Update Customer' : 'Add Customer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
