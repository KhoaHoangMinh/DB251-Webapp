import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCcw, Search } from 'lucide-react';
import OrderTable from './OrderTable';

interface Order {
  orderID: string;
  dateOrder: string;
  customerID: string;
  storeID: string;
  orderStatus: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const searchOrders = async (term: string) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/search?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error searching orders:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchOrders();
    } else {
      searchOrders(searchTerm);
    }
  }, [searchTerm]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderID.toLowerCase().includes(searchLower) ||
      order.customerID.toLowerCase().includes(searchLower) ||
      order.storeID.toLowerCase().includes(searchLower) ||
      order.orderStatus.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-gray-900">Order Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage customer orders
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={fetchOrders}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Order ID, Customer ID, Store ID, or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Order Table */}
      <OrderTable orders={orders} />
    </div>
  );
}
