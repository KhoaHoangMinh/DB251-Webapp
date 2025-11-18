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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";

interface Product {
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdDate: string;
}

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: Product) => void; // Callback to refresh the product list after saving
}

export default function ProductDialog({ product, open, onOpenChange, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    productName: '',
    productDescription: '',
    price: 0,
    stockQuantity: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        productName: '',
        productDescription: '',
        price: 0,
        stockQuantity: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [product, open]);

  const handleChange = (field: keyof Product, value: string | number | boolean) => {
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
    if (!formData.productName) newErrors.productName = 'Product name is required.';
    if (!formData.productDescription) newErrors.productDescription = 'Product description is required.';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0.';
    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative.';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData as Product);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Product Name */}
            <div className="col-span-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                placeholder="Product Name"
              />
              {errors.productName && <p className="text-red-500 text-sm">{errors.productName}</p>}
            </div>

            {/* Product Description */}
            <div className="col-span-2">
              <Label htmlFor="productDescription">Product Description</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => handleChange('productDescription', e.target.value)}
                placeholder="Product Description"
                rows={3}
              />
              {errors.productDescription && <p className="text-red-500 text-sm">{errors.productDescription}</p>}
            </div>

            {/* Price */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                placeholder="Price"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            {/* Stock Quantity */}
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value))}
                placeholder="Stock Quantity"
              />
              {errors.stockQuantity && <p className="text-red-500 text-sm">{errors.stockQuantity}</p>}
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
            <Button type="submit">{product ? 'Update Product' : 'Add Product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
