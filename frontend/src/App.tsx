import { useState } from 'react';
import LoginPage from './components/LoginPage';
import MainManagement from './components/MainManagement';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetail from './components/ProductDetail';
import Bag from './components/Bag';
import { Toaster } from 'sonner';
// import { Toaster } from 'sonner@2.0.3';
// import imgRectangle3 from 'figma:asset/3796b349f68c30f5881121394007bfd1d5fa12ac.png';
// import imgRectangle4 from 'figma:asset/896ffe66b0d16476908f571e0ae0a4244bcf788f.png';
// import imgRectangle5 from 'figma:asset/af5cf6d4b5e180919f1399c165c1f6faf174b1a6.png';

import imgRectangle3 from './components/static/swoosh.png';
import imgRectangle4 from './components/static/swoosh.png';
import imgRectangle5 from './components/static/swoosh.png';

type View = 'management' | 'home' | 'shop' | 'product-detail' | 'bag';

export interface CartItem {
  id: string;
  productID: string;
  productName: string;
  productDescription: string;
  price: number;
  category: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

// Hardcoded initial cart items
const initialCartItems: CartItem[] = [
  {
    id: 'cart-item-1',
    productID: 'PRO0001',
    productName: 'Nike Air Force 1',
    productDescription: 'Classic white leather sneakers',
    price: 110,
    category: 'NIKE',
    image: imgRectangle3,
    size: 'L',
    color: 'Gray',
    quantity: 2,
  },
  {
    id: 'cart-item-2',
    productID: 'PRO0002',
    productName: 'Nike Air Max 270',
    productDescription: 'Comfortable lifestyle shoes with Max Air unit',
    price: 150,
    category: 'NIKE',
    image: imgRectangle4,
    size: 'XL',
    color: 'Black',
    quantity: 1,
  },
  {
    id: 'cart-item-3',
    productID: 'PRO0003',
    productName: 'Nike Dri-FIT T-Shirt',
    productDescription: 'Breathable training shirt',
    price: 35,
    category: 'NIKE',
    image: imgRectangle5,
    size: 'M',
    color: 'White',
    quantity: 3,
  },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('management');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(initialCartItems);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('management');
  };

  const handleNavigateToShop = () => {
    setCurrentView('shop');
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  const handleBackToShop = () => {
    setCurrentView('shop');
  };

  const handleBackToManagement = () => {
    setCurrentView('management');
  };

  const handleNavigateToBag = () => {
    setCurrentView('bag');
  };

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.productID}-${item.size}-${item.color}-${Date.now()}`,
    };
    setCart([...cart, newItem]);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  // if (!isLoggedIn) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

    if (currentView === 'home') {
    return (
      <>
        <Toaster position="top-right" />
        <Home
          onNavigateToShop={handleNavigateToShop}
          onBackToManagement={handleBackToManagement}
          onNavigateToBag={handleNavigateToBag}
          cartItemCount={cart.length}
        />
      </>
    );
  }

  if (currentView === 'shop') {
    return (
      <>
        <Toaster position="top-right" />
        <Shop
          onProductClick={handleProductClick}
          onBackToManagement={handleBackToManagement}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToBag={handleNavigateToBag}
          cartItemCount={cart.length}
        />
      </>
    );
  }

  if (currentView === 'product-detail' && selectedProductId) {
    return (
      <>
        <Toaster position="top-right" />
        <ProductDetail
          productId={selectedProductId}
          onBack={handleBackToShop}
          onNavigateToHome={handleNavigateToHome}
          onAddToCart={handleAddToCart}
          onNavigateToBag={handleNavigateToBag}
          cartItemCount={cart.length}
        />
      </>
    );
  }

  if (currentView === 'bag') {
    return (
      <>
        <Toaster position="top-right" />
        <Bag
          cart={cart}
          customerID="CUS0001"
          onBack={handleBackToShop}
          onNavigateToHome={handleNavigateToHome}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </>
    );
  }

  // return <MainManagement currentUser={currentUser} onLogout={handleLogout} />;
  return <MainManagement currentUser={currentUser} onLogout={handleLogout} onNavigateToShop={handleNavigateToHome} />;

}
