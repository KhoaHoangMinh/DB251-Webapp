import { ImageWithFallback } from './figma/ImageWithFallback';
import imgImage1 from './static/swoosh.png';
import imgHero from './static/swoosh.png';
import background from './static/home_background.png';
import { ShoppingBag, ArrowRight, Home as HomeIcon } from 'lucide-react';
import { Button } from './ui/button';

interface HomeProps {
  onNavigateToShop: () => void;
  onBackToManagement: () => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
}

function Header({ onBackToManagement, onNavigateToBag, cartItemCount, onNavigateToShop }: { 
  onBackToManagement: () => void;
  onNavigateToBag: () => void;
  cartItemCount: number;
  onNavigateToShop: () => void;
}) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBackToManagement} className="h-[53px] w-[88px] hover:opacity-80 transition-opacity">
              <img alt="Nike Logo" className="w-full h-full object-cover" src={imgImage1} />
            </button>
            <nav className="flex items-center gap-6">
              <span className="text-gray-900 cursor-pointer hover:text-gray-600 transition-colors">Home</span>
              <span onClick={onNavigateToShop} className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">Products</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
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
            <Button onClick={onBackToManagement} variant="outline">
              <HomeIcon className="w-4 h-4 mr-2" />
              Management
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home({ onNavigateToShop, onBackToManagement, onNavigateToBag, cartItemCount }: HomeProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header
        onBackToManagement={onBackToManagement}
        onNavigateToBag={onNavigateToBag}
        cartItemCount={cartItemCount}
        onNavigateToShop={onNavigateToShop}
      />

      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-gray-100 overflow-hidden"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-6xl font-extrabold mb-4 tracking-wider">JUST DO IT</h1> {/* Added font-extrabold and tracking-wider for emphasis */}
          <p className="text-xl mb-8">Discover the latest innovation in athletic performance</p>
          <Button
            onClick={onNavigateToShop}
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Shop Now
            <ArrowRight className="w-5 h-5 ml-2"/>
          </Button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl mb-4">Move the World Forward</h2>
          <p className="text-xl mb-8 text-gray-300">Experience innovation designed for athletes at every level</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onNavigateToShop}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
            >
            Explore Products
            </Button>
            <Button
              variant="outline"
              className="border-white text-white text-gray-900 px-8 py-6 text-lg rounded-full"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="mb-4">Get Help</h3>
              <ul className="space-y-2 text-sm text-black-400">
                <li className="hover:text-gray cursor-pointer">Order Status</li>
                <li className="hover:text-gray cursor-pointer">Delivery</li>
                <li className="hover:text-gray cursor-pointer">Returns</li>
                <li className="hover:text-gray cursor-pointer">Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">About Nike</h3>
              <ul className="space-y-2 text-sm text-black-400">
                <li className="hover:text-gray cursor-pointer">News</li>
                <li className="hover:text-gray cursor-pointer">Careers</li>
                <li className="hover:text-gray cursor-pointer">Investors</li>
                <li className="hover:text-gray cursor-pointer">Sustainability</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-black-400">
                <li className="hover:text-gray cursor-pointer">All Products</li>
                <li className="hover:text-gray cursor-pointer">New Releases</li>
                <li className="hover:text-gray cursor-pointer">Sale</li>
                <li className="hover:text-gray cursor-pointer">Gift Cards</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Follow Us</h3>
              <ul className="space-y-2 text-sm text-black-400">
                <li className="hover:text-gray cursor-pointer">Instagram</li>
                <li className="hover:text-gray cursor-pointer">Twitter</li>
                <li className="hover:text-gray cursor-pointer">Facebook</li>
                <li className="hover:text-gray cursor-pointer">YouTube</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black-800 pt-8 flex justify-between text-sm text-black-400">
            <p>© 2025 Nike, Inc. All Rights Reserved</p>
            <div className="flex gap-6">
              <span className="hover:text-gray cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray cursor-pointer">Terms of Use</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}