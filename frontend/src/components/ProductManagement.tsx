import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search } from 'lucide-react';
import ProductTable from './ProductTable';
import ProductDialog from './ProductDialog';

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

// Mock product data
const initialProducts: Product[] = [
  {
    id: '1',
    productId: 'PRD001',
    productName: 'Wireless Mouse',
    category: 'Electronics',
    description: 'Ergonomic wireless mouse with USB receiver',
    price: 29.99,
    stockQuantity: 150,
    supplier: 'Tech Supplies Inc.',
    sku: 'WM-2024-001',
    dateAdded: '2024-01-10',
    status: 'Active'
  },
  {
    id: '2',
    productId: 'PRD002',
    productName: 'USB-C Cable',
    category: 'Accessories',
    description: '6ft braided USB-C charging cable',
    price: 12.99,
    stockQuantity: 300,
    supplier: 'Cable World',
    sku: 'UC-2024-002',
    dateAdded: '2024-02-15',
    status: 'Active'
  },
  {
    id: '3',
    productId: 'PRD003',
    productName: 'Mechanical Keyboard',
    category: 'Electronics',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.99,
    stockQuantity: 75,
    supplier: 'Tech Supplies Inc.',
    sku: 'MK-2024-003',
    dateAdded: '2024-03-20',
    status: 'Active'
  },
  {
    id: '4',
    productId: 'PRD004',
    productName: 'Desk Lamp',
    category: 'Furniture',
    description: 'Adjustable LED desk lamp with touch control',
    price: 45.50,
    stockQuantity: 60,
    supplier: 'Office Essentials Ltd.',
    sku: 'DL-2024-004',
    dateAdded: '2023-11-05',
    status: 'Active'
  },
  {
    id: '5',
    productId: 'PRD005',
    productName: 'Notebook Set',
    category: 'Stationery',
    description: 'Pack of 5 spiral notebooks, A5 size',
    price: 15.99,
    stockQuantity: 200,
    supplier: 'Paper Products Co.',
    sku: 'NB-2024-005',
    dateAdded: '2024-01-25',
    status: 'Active'
  },
  {
    id: '6',
    productId: 'PRD006',
    productName: 'Monitor Stand',
    category: 'Furniture',
    description: 'Wooden monitor stand with storage drawer',
    price: 39.99,
    stockQuantity: 45,
    supplier: 'Office Essentials Ltd.',
    sku: 'MS-2024-006',
    dateAdded: '2023-12-10',
    status: 'Active'
  }
];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(prod => prod.id !== id));
  };

  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(prod => prod.id === product.id ? product : prod));
    } else {
      // Add new product
      const newProduct = {
        ...product,
        id: Date.now().toString()
      };
      setProducts([...products, newProduct]);
    }
    setIsDialogOpen(false);
  };

  const filteredProducts = products.filter(prod => {
    const searchLower = searchTerm.toLowerCase();
    return (
      prod.productId.toLowerCase().includes(searchLower) ||
      prod.productName.toLowerCase().includes(searchLower) ||
      prod.category.toLowerCase().includes(searchLower) ||
      prod.supplier.toLowerCase().includes(searchLower) ||
      prod.sku.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-gray-900">Product Catalog</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage product inventory and information
            </p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by ID, name, category, supplier, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Product Dialog */}
      <ProductDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
