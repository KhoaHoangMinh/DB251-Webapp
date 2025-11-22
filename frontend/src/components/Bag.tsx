import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
// import imgImage1 from 'figma:asset/a6e9b49adeaf7f41c4d30833bcdbc09e8bf03b4a.png';
import imgImage1 from './static/swoosh.png';

interface BagProps {
  cart: CartItem[];
  onBack: () => void;
  onNavigateToHome: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

function Header({ onBack, onNavigateToHome }: { onBack: () => void; onNavigateToHome: () => void }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onNavigateToHome} className="h-[53px] w-[88px] hover:opacity-80 transition-opacity">
              <img alt="Nike Logo" className="w-full h-full object-cover" src={imgImage1} />
            </button>
            <div>
              <h1 className="text-gray-900">Shopping Bag</h1>
              <p className="text-sm text-gray-600 mt-1">Review your items</p>
            </div>
          </div>

          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    </header>
  );
}

function CartItemCard({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}: { 
  item: CartItem; 
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            alt={item.productName} 
            className="w-full h-full object-cover" 
            src={item.image} 
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">{item.productName}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.productDescription}</p>
              <p className="text-sm text-gray-600 mb-1">Category: {item.category}</p>
              <p className="text-sm text-gray-600 mb-1">Color: {item.color}</p>
              <p className="text-sm text-gray-600">Size: {item.size}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900">${item.price}</p>
            </div>
          </div>

          {/* Quantity and Remove */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-gray-900 w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={onRemove}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
      <h2 className="text-gray-900 mb-2">Your bag is empty</h2>
      <p className="text-gray-600 mb-6">Add some products to get started</p>
      <Button onClick={onBack}>
        Continue Shopping
      </Button>
    </div>
  );
}

function OrderSummary({ 
  subtotal, 
  shipping, 
  total 
}: { 
  subtotal: number; 
  shipping: number; 
  total: number; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
      <h2 className="text-gray-900 mb-6">Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Delivery & Handling</span>
          <span className="text-gray-900">${shipping.toFixed(2)}</span>
        </div>

        <div className="h-px bg-gray-200"></div>

        <div className="flex justify-between">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>

        <div className="h-px bg-gray-200"></div>
      </div>

      <div className="space-y-3">
        <Button className="w-full" size="lg">
          Member Checkout
        </Button>
        <Button className="w-full" size="lg" variant="outline">
          Guest Checkout
        </Button>
      </div>
    </div>
  );
}

export default function Bag({ cart, onBack, onNavigateToHome, onRemoveItem, onUpdateQuantity }: BagProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBack={onBack} onNavigateToHome={onNavigateToHome} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          <EmptyCart onBack={onBack} />
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-gray-900 mb-4">Bag</h2>
              {cart.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => onRemoveItem(item.id)}
                  onUpdateQuantity={(quantity) => onUpdateQuantity(item.id, quantity)}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="col-span-1">
              <OrderSummary 
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}