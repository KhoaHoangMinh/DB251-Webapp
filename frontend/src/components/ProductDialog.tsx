import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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

interface Product {
  id: string;
  productId: string;
  productName: string;
  category: string;
  description: string;
  price: number;
  stockQuantity: number;
  supplier: string;
  sku: string;
  dateAdded: string;
  status: 'Active' | 'Discontinued';
}

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
}

const categories = ['Electronics', 'Accessories', 'Furniture', 'Stationery', 'Office Supplies'];
const suppliers = {
  Electronics: ['Tech Supplies Inc.', 'Digital World', 'Electronics Hub'],
  Accessories: ['Cable World', 'Tech Accessories Co.', 'Gadget Store'],
  Furniture: ['Office Essentials Ltd.', 'Furniture Pro', 'Modern Office'],
  Stationery: ['Paper Products Co.', 'Writing Supplies', 'Office Stationery'],
  'Office Supplies': ['Office Depot Partners', 'Supply Central', 'Business Essentials']
};

export default function ProductDialog({ product, open, onOpenChange, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    productId: '',
    productName: '',
    category: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    supplier: '',
    sku: '',
    dateAdded: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setAvailableSuppliers(suppliers[product.category as keyof typeof suppliers] || []);
    } else {
      setFormData({
        productId: '',
        productName: '',
        category: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        supplier: '',
        sku: '',
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      setAvailableSuppliers([]);
    }
    setErrors({});
  }, [product, open]);

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      supplier: '' // Reset supplier when category changes
    });
    setAvailableSuppliers(suppliers[category as keyof typeof suppliers] || []);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Product ID validation
    if (!formData.productId?.trim()) {
      newErrors.productId = 'Product ID is required.';
    } else if (!/^PRD\d{3,}$/.test(formData.productId)) {
      newErrors.productId = 'Product ID must be in format PRD### (e.g., PRD001).';
    }

    // Product Name validation
    if (!formData.productName?.trim()) {
      newErrors.productName = 'Product name is required.';
    } else if (formData.productName.length < 3) {
      newErrors.productName = 'Product name must be at least 3 characters long.';
    } else if (formData.productName.length > 100) {
      newErrors.productName = 'Product name cannot exceed 100 characters.';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required. Please select a category.';
    }

    // Description validation
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters.';
    }

    // Price validation
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero.';
    } else if (formData.price > 999999) {
      newErrors.price = 'Price cannot exceed $999,999.';
    }

    // Stock Quantity validation
    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative.';
    } else if (formData.stockQuantity > 100000) {
      newErrors.stockQuantity = 'Stock quantity cannot exceed 100,000 units.';
    }

    // Supplier validation
    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required. Please select a supplier.';
    }

    // SKU validation
    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU is required.';
    } else if (!/^[A-Z]{2,3}-\d{4}-\d{3}$/.test(formData.sku)) {
      newErrors.sku = 'SKU must be in format XX-####-### (e.g., WM-2024-001).';
    }

    // Date Added validation
    if (!formData.dateAdded) {
      newErrors.dateAdded = 'Date added is required.';
    } else {
      const dateAdded = new Date(formData.dateAdded);
      const today = new Date();
      const minDate = new Date('2020-01-01');
      
      if (dateAdded > today) {
        newErrors.dateAdded = 'Date added cannot be in the future.';
      } else if (dateAdded < minDate) {
        newErrors.dateAdded = 'Date added must be after January 1, 2020.';
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

    onSave(formData as Product);
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
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? 'Update the product information below. All fields are required.'
              : 'Enter the product information below. All fields are required.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Product ID */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="productId">
                Product ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productId"
                placeholder="PRD001"
                value={formData.productId}
                onChange={(e) => handleChange('productId', e.target.value)}
              />
              {errors.productId && (
                <p className="text-sm text-red-600 mt-1">{errors.productId}</p>
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
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Name */}
            <div className="col-span-2">
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="Wireless Mouse"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
              />
              {errors.productName && (
                <p className="text-sm text-red-600 mt-1">{errors.productName}</p>
              )}
            </div>

            {/* Category */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Supplier */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => handleChange('supplier', value)}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {availableSuppliers.map((sup) => (
                    <SelectItem key={sup} value={sup}>
                      {sup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier && (
                <p className="text-sm text-red-600 mt-1">{errors.supplier}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter product description..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="29.99"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price}</p>
              )}
            </div>

            {/* Stock Quantity */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="stockQuantity">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="100"
                value={formData.stockQuantity || ''}
                onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value) || 0)}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-600 mt-1">{errors.stockQuantity}</p>
              )}
            </div>

            {/* SKU */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                placeholder="WM-2024-001"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
              />
              {errors.sku && (
                <p className="text-sm text-red-600 mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Date Added */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="dateAdded">
                Date Added <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateAdded"
                type="date"
                value={formData.dateAdded}
                onChange={(e) => handleChange('dateAdded', e.target.value)}
              />
              {errors.dateAdded && (
                <p className="text-sm text-red-600 mt-1">{errors.dateAdded}</p>
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
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
