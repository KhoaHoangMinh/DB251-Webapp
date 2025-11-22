import {useEffect, useState} from 'react';
import svgPaths from '../imports/svg-2ijf4c8ns8';
import imgRectangle3 from './static/swoosh.png';
import imgRectangle4 from './static/swoosh.png';
import imgRectangle5 from './static/swoosh.png';
import imgRectangle6 from './static/swoosh.png';
import imgRectangle7 from './static/swoosh.png';
import imgRectangle8 from './static/swoosh.png';
import imgImage1 from './static/swoosh.png';
import { Search, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { toast } from 'sonner@2.0.3';

const sizes = ['XS', 'S', 'L', 'ML', 'XL', '2X'];
const colors = [
  { name: 'Gray', color: '#d9d9d9' },
  { name: 'Mint', color: '#a6d6ca' },
  { name: 'Dark Gray', color: 'darkgrey' },
  { name: 'Black', color: '#1e1e1e' },
  { name: 'White', color: 'white' },
  { name: 'Lavender', color: '#b9c1e8' },
];

const thumbnails = [imgRectangle4, imgRectangle5, imgRectangle6, imgRectangle7, imgRectangle8];

interface Product {
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdDate: string;
}

// Product database matching ProductManagement structure
const productDatabase = [
  {
    productID: 'P001',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 50,
    isActive: true,
    createdDate: '2025-01-01',
    category: 'SHIRTS',
    image: imgRectangle3
  },
  {
    productID: 'P002',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 45,
    isActive: true,
    createdDate: '2025-01-02',
    category: 'SHIRTS',
    image: imgRectangle4
  },
  {
    productID: 'P003',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 60,
    isActive: true,
    createdDate: '2025-01-03',
    category: 'SHIRTS',
    image: imgRectangle5
  },
  {
    productID: 'P004',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 40,
    isActive: true,
    createdDate: '2025-01-04',
    category: 'SHIRTS',
    image: imgRectangle6
  },
  {
    productID: 'P005',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 55,
    isActive: true,
    createdDate: '2025-01-05',
    category: 'SHIRTS',
    image: imgRectangle7
  },
  {
    productID: 'P006',
    productName: 'BASIC SLIM FIT SHIRT',
    productDescription: 'Cotton T-Shirt',
    price: 199,
    stockQuantity: 35,
    isActive: true,
    createdDate: '2025-01-06',
    category: 'SHIRTS',
    image: imgRectangle8
  },
];

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onNavigateToHome: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
}

function Header({ onBack, onNavigateToHome, onNavigateToBag, cartItemCount }: {
  onBack: () => void;
  onNavigateToHome: () => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
}) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onNavigateToHome} className="h-[53px] w-[88px] hover:opacity-80 transition-opacity">
              <img alt="Nike Logo" className="w-full h-full object-cover" src={imgImage1} />
            </button>
            <div>
              <h1 className="text-gray-900">Product Details</h1>
              <p className="text-sm text-gray-600 mt-1">View and customize your selection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
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

export default function ProductDetail({ productId, onBack, onNavigateToHome, onAddToCart, onNavigateToBag, cartItemCount }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState<Product[]>([]);

  const getProductData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/products/${encodeURIComponent(productId)}`);
      const data = await  response.json();
      setProductData(data);
    } catch (error) {
      console.error('Error getting product', error);
    }
  }

  useEffect(() => {
    getProductData();
  }, []);

  // Find product from database
  // const productData = productDatabase.find(product => product.productID === productId) || productDatabase[0];
  // const productData = productDatabase.find(product => product.productID === productId) || productDatabase[0];

  const handleAddToCart = () => {
    if (selectedSize && selectedColor !== null) {
      onAddToCart({
        productID: productData.productID,
        productName: productData.productName,
        productDescription: productData.productDescription,
        price: productData.price,
        category: productData.category || 'SHIRTS',
        image: productData.image || thumbnails[0],
        size: selectedSize,
        color: colors[selectedColor].name,
        quantity,
      });
      toast.success('Added to cart!');
    } else {
      toast.error('Please select size and color');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBack={onBack} onNavigateToHome={onNavigateToHome} onNavigateToBag={onNavigateToBag} cartItemCount={cartItemCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <button onClick={onNavigateToHome} className="hover:text-gray-900 transition-colors">Home</button>
            <span className="mx-2">/</span>
            <button onClick={onBack} className="hover:text-gray-900 transition-colors">Products</button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{productData.productName}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Side - Image Gallery */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                alt="Product"
                className="w-full h-full object-cover"
                src={productData.image || thumbnails[selectedThumbnail]}
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-3">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedThumbnail(idx)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedThumbnail === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img alt="" className="w-full h-full object-cover" src={thumb} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h className="text-gray-900 text-xl font-semibold mb-2">{productData.productName}</h>
                <p className="text-sm text-gray-600 mb-2">{productData.productDescription}</p>
                <p className="text-gray-900">${productData.price}</p>
                <p className="text-sm text-gray-600 mt-1">Stock: {productData.stockQuantity} available</p>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-gray-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>

              {/* Review Section */}
              <div className="pt-6 border-t">
                <h3 className="text-sm text-gray-900 mb-3">Customer Review</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I'm super happy with these! I've never bought jeans online before and I didn't think they'd even fit, but it turns out they fit pretty perfectly. I got a size 28- I'm 5'6" and weigh about 127 lbs. They are tight but not suffocating...
                  </p>
                </div>
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t">
                <h3 className="text-sm text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex">
                    <span className="w-32">Material:</span>
                    <span>100% Cotton</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Fit:</span>
                    <span>Slim Fit</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Care:</span>
                    <span>Machine wash cold</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">SKU:</span>
                    <span>NS-{productId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}