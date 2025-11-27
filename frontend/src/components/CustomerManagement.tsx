import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import CustomerTable from './CustomerTable';
import CustomerDialog from './CustomerDialog';

interface Customer {
  customerID: string;
  customerName: string;
  age: number;
  dateOfBirth: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  isActive: boolean;
}

interface SummaryStats {
  total_Customers: number;
  avg_age: number;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [topCustomer, setTopCustomer] = useState<Customer>();
  const [summaryStats, setSummaryStats] = useState<SummaryStats>();

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8000/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
    fetchTopCustomer();
    fetchSummaryStats();
  };

  const fetchTopCustomer = async () => {
    try {
      const response = await fetch('http://localhost:8000/customers/top_customers/1');
      const data = await response.json();
      if (data.length > 0) {
        setTopCustomer(data[0]); // Assuming the API returns an array with the top customer
      }
    } catch (error) {
      console.error('Error fetching the top customer:', error);
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/customers/stats');
      const data = await response.json();
      setSummaryStats(data);
    } catch (error) {
      console.error('Error fetching the top customer:', error);
    }
  };

  const searchCustomers = async (term: string) => {
    try {
      const response = await fetch(`http://localhost:8000/customers/search?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchCustomers();
    } else {
      searchCustomers(searchTerm);
    }
    fetchTopCustomer();
    fetchSummaryStats();
  }, [searchTerm]);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    if (selectedCustomer) {
      // Update existing customer
      try {
        const response = await fetch(`http://localhost:8000/customers/${customer.customerID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });
        if (!response.ok) throw new Error('Failed to update customer');
        fetchCustomers();
      } catch (error) {
        console.error('Error updating customer:', error);
      }
    } else {
      // Add new customer
      try {
        const response = await fetch('http://localhost:8000/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });
        if (!response.ok) throw new Error('Failed to create customer');
        fetchCustomers();
      } catch (error) {
        console.error('Error creating customer:', error);
      }
    }
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-gray-900">Customer Directory</h2>
            <p className="text-sm text-gray-600 mt-1">Manage customer information and records</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAddCustomer}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
            <Button onClick={fetchCustomers}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div>
        {/* Display Top Customer */}
        {topCustomer && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4 py-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer Summary stats</h3>
                <p className="text-sm text-gray-600">
                  <strong>Total Customers:</strong> {summaryStats.total_Customers}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Average Age:</strong> ${summaryStats.avg_age.toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Customer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Name:</strong> {topCustomer.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Spent:</strong> ${topCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

          </div>
        )}

        <CustomerTable customers={customers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer}/>
      </div>
      <CustomerDialog
        customer={selectedCustomer}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
