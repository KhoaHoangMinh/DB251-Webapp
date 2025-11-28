import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import imgImage1 from './static/swoosh.png';
import { API_BASE_URL } from '../config/api';

interface CartItem {
  cartID: string;
  productID: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productDescription: string;
}

interface BagProps {
  customerID: string;
  onBack: () => void;
  onNavigateToHome: () => void;
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

export default function Bag({ customerID, onBack, onNavigateToHome }: BagProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState({ totalQuantity: 0, totalAmount: 0 });

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${customerID}`);
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [customerID]);

  const handleMakeOrder = () => {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setOrderSummary({ totalQuantity, totalAmount });
    setIsOrderDialogOpen(true);
  };

  const confirmOrder = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerID: 'CUS0001',
          storeID: 'STO0001',
          orderStatus: 'Pending',
        // Hard coded
        }),
      });
      setIsOrderDialogOpen(false);
      fetchCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = 15.0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

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
                <CartItemCard key={item.productID} item={item} onItemRemoved={fetchCart} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="col-span-1">
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                onMakeOrder={handleMakeOrder}
              />
            </div>
          </div>
        )}
      </main>

      {/* Order Confirmation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>

          {/* Row 1: Quantity */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-muted-foreground">Total Items</span>
            <span>{orderSummary.totalQuantity}</span>
          </div>

          {/* Subtotal Row */}
          <div className="flex justify-between text-sm mb-6">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${orderSummary.totalAmount.toFixed(2)}</span>
          </div>

          {/* Button Container */}
          <div className="flex flex-col gap-2"> {/* Added flex-col to stack buttons vertically */}
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmOrder}>Confirm Order</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CartItemCard({ 
  item, 
  onItemRemoved 
}: { 
  item: CartItem; 
  onItemRemoved: () => void;
}) {
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductName = async () => {
      try {
        const response = await fetch(`http://localhost:8000/products/${item.productID}`);
        const product = await response.json();
        setProductName(product.productName);
      } catch (error) {
        console.error('Error fetching product name:', error);
        setProductName('Unknown Product');
      }
    };

    fetchProductName();
  }, [item.productID]);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      console.error('Quantity must be greater than 0');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/cart/${newQuantity}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartID: item.cartID, productID: item.productID }),
      });

      if (response.ok) {
        onItemRemoved(); // Trigger re-fetch of the cart
      } else {
        const error = await response.json();
        console.error('Failed to update quantity:', error.detail || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async () => {
    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartID: item.cartID, productID: item.productID }),
      });

      onItemRemoved(); // Trigger re-fetch of the cart
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex gap-6">
        {/* Product Details */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">{productName || 'Loading...'}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.productDescription}</p>
              <p className="text-sm text-gray-600 mb-1">Product ID: {item.productID}</p>
              <p className="text-sm text-gray-600 mb-1">Cart ID: {item.cartID}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900">${item.unitPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Quantity and Remove */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.quantity - 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-gray-900 w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleRemoveItem}
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
  total, 
  onMakeOrder 
}: { 
  subtotal: number; 
  shipping: number; 
  total: number; 
  onMakeOrder: () => void;
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
        <Button className="w-full" size="lg" onClick={onMakeOrder}>
          Make Order
        </Button>
      </div>
    </div>
  );
}

