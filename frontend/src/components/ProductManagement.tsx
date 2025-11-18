import {useEffect, useState} from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search } from 'lucide-react';
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchProducts();
    } else {

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

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(prod => prod.productID !== id));
  };

  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(prod => prod.productID === product.productID ? product : prod));
    } else {
      // Add new product
      const newProduct = {
        ...product,
        productID: Date.now().toString(),
        createdDate: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
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
            placeholder="Search by ID, name, or description..."
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
