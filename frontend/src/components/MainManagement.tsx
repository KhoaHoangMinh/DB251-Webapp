import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Users, Package } from 'lucide-react';
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
          <TabsList className="grid w-full max-w-md mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
