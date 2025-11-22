import { useState, useEffect } from 'react';
import imgImage1 from './static/swoosh.png';
import { Search, ShoppingBag, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Product {
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdDate: string;
}

// Commented database remains intact
const productsDatabase: Product[] = [
  {
    productID: 'P001',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 50,
    isActive: true,
    createdDate: '2025-01-01',
  },
  {
    productID: 'P002',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 45,
    isActive: true,
    createdDate: '2025-01-02',
  },
  {
    productID: 'P003',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 60,
    isActive: true,
    createdDate: '2025-01-03',
  },
  {
    productID: 'P004',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 40,
    isActive: true,
    createdDate: '2025-01-04',
  },
  {
    productID: 'P005',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 55,
    isActive: true,
    createdDate: '2025-01-05',
  },
  {
    productID: 'P006',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 35,
    isActive: true,
    createdDate: '2025-01-06',
  },
];

const sizes = ['XS', 'S', 'L', 'ML', 'XL', '2X'];

interface ShopProps {
  onProductClick: (productId: string) => void;
  onBackToManagement: () => void;
  onNavigateToHome: () => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
}

function Header({ onBackToManagement, onNavigateToHome, onNavigateToBag, cartItemCount }: {
  onBackToManagement: () => void;
  onNavigateToHome: () => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
}) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onNavigateToHome} className="h-[53px] w-[88px] hover:opacity-80 transition-opacity">
              <img alt="Nike Logo" className="w-full h-full object-cover" src={imgImage1} />
            </button>
            <h1 className="text-gray-900">Nike Store</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onBackToManagement} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Management
            </Button>

            <button
              onClick={onNavigateToBag}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
      <div>
        <h2 className="text-gray-900 mb-4">Filters</h2>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-sm text-gray-900 mb-3">Size</h3>
        <div className="grid grid-cols-6 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size === selectedSize ? null : size)}
              className={`border h-[44px] flex items-center justify-center rounded transition-colors ${
                selectedSize === size 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{size}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="w-full aspect-[4/5] bg-gray-200 overflow-hidden flex items-center justify-center">
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-1">{product.productDescription}</p>
        <p className="text-gray-900 mb-2">{product.productName}</p>
        <p className="text-gray-900">${product.price}</p>
      </div>
    </div>
  );
}

export default function Shop({ onProductClick, onBackToManagement, onNavigateToHome, onNavigateToBag, cartItemCount }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setsearchTerm] = useState('');
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products'); // Adjust the URL if needed
      const data = await response.json();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBackToManagement={onBackToManagement} onNavigateToHome={onNavigateToHome} onNavigateToBag={onNavigateToBag} cartItemCount={cartItemCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <button onClick={onNavigateToHome} className="hover:text-gray-900 transition-colors">Home</button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Products</span>
          </p>
        </div>

        {/* Page Title and Search */}
        <div className="mb-6">
          <h1 className="text-gray-900 mb-4">Products</h1>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setsearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {/* Product Grid */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">{products.length} products found</p>
              <select className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.productID} 
                  product={product} 
                  onClick={() => onProductClick(product.productID)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}