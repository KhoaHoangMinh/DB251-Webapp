import {useEffect, useState} from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {Plus, RefreshCcw, Search} from 'lucide-react';
import ProductTable from './ProductTable';
import ProductDialog from './ProductDialog';

interface Product {
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdDate: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products');
      const data = await  response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const searchProducts = async (term: string) => {
    try {
      const response = await fetch(`http://localhost:8000/products/search?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchProducts();
    } else {
      searchProducts(searchTerm);
    }

  }, [searchTerm]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
    fetchProducts();
  };

  const handleSaveProduct = async (product: Product) => {
    if (selectedProduct) {
      // Update existing product
      try {
        const response = await fetch(`http://localhost:8000/products/${product.productID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error('Failed to update product');
        }

        const updatedProduct = await response.json();
        setProducts(products.map(prod => prod.productID === updatedProduct.productID ? updatedProduct : prod));
      } catch (error) {
        console.error('Error updating product:', error);
      }
    } else {
      // Add new product
      try {
        const response = await fetch('http://localhost:8000/products/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error('Failed to create product');
        }

        const newProduct = await response.json();
        setProducts([...products, newProduct]);
      } catch (error) {
        console.error('Error creating product:', error);
      }
    }
    setIsDialogOpen(false);
  };

  const filteredProducts = products.filter(prod => {
    const searchLower = searchTerm.toLowerCase();
    return (
      prod.productID.toLowerCase().includes(searchLower) ||
      prod.productName.toLowerCase().includes(searchLower) ||
      prod.productDescription.toLowerCase().includes(searchLower)
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

          <div className="flex gap-4">
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button onClick={fetchProducts}>
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
            placeholder="Search by ID, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        products={products}
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
