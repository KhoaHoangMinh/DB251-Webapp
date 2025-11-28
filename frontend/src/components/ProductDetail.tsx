import {useEffect, useState} from 'react';
import svgPaths from '../imports/svg-2ijf4c8ns8';
import { API_BASE_URL } from '../config/api';

import swoosh from './static/swoosh.png';
import thumbnail1 from './static/pic1.jpg';
import thumbnail2 from './static/pic2.png';
import thumbnail3 from './static/pic3.jpg';
import thumbnail4 from './static/pic4.png';
import thumbnail5 from './static/pic5.jpg';
import thumbnail6 from './static/pic6.jpg';

import { Search, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { toast } from 'sonner@2.0.3';

const thumbnails = [thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5, thumbnail6];

interface Product {
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdDate: string;
}

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onNavigateToHome: () => void;
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
              <img alt="Nike Logo" className="w-full h-full object-cover" src={swoosh}/>
            </button>
            <div>
              <h1 className="text-gray-900">Product Details</h1>
              <p className="text-sm text-gray-600 mt-1">View and customize your selection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToBag}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-6 h-6"/>
            </button>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Shop
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
}

export default function ProductDetail({
                                        productId,
                                        onBack,
                                        onNavigateToHome,
                                        onNavigateToBag,
                                        cartItemCount
                                      }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState<Product[]>([]);

  const getProductData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`);
      const data = await  response.json();
      setProductData(data);
    } catch (error) {
      console.error('Error getting product', error);
    }
  }

  useEffect(() => {
    getProductData();
  }, []);

  const handleAddToCart = async () => {
    try {
      const response = await fetch('http://localhost:8000/cart/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartID: 'CRT0001',
          // Hard coded cart id
          productID: productData.productID,
          quantity,
          unitPrice: productData.price,
        }),
      });

      if (response.ok) {
        toast.success('Added to cart!');
      } else {
        const error = await response.json();
        toast.error(`Failed to add to cart: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
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