import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Users, Package, CircleUser, ShoppingCart, Building} from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';
import ProductManagement from './ProductManagement';

interface MainManagementProps {
  currentUser: string | null;
  onLogout: () => void;
}

export default function MainManagement({ currentUser, onLogout }: MainManagementProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Management System</h1>
              <p className="text-sm text-gray-600 mt-1">Logged in as: {currentUser}</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full max-w-2xl mb-6" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <CircleUser className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Stores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="customers">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="orders">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="stores">
            <ProductManagement />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
