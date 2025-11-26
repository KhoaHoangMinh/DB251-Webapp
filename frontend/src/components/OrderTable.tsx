import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';

interface Order {
  orderID: string;
  dateOrder: string;
  customerID: string;
  storeID: string;
  orderStatus: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  orderStatus: string;
}

interface OrderDetails {
  orderID: string;
  dateOrder: string;
  customerName: string;
  storeName: string;
  itemList: OrderItem[];
}

interface OrderTableProps {
  orders: Order[];
}

type SortField = 'orderID' | 'dateOrder' | 'customerID' | 'storeID' | 'orderStatus';
type SortOrder = 'asc' | 'desc';

export default function OrderTable({ orders }: OrderTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [orderDetails, setOrderDetails] = useState<Record<string, OrderDetails>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('orderID');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'dateOrder') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const fetchOrderDetails = async (orderID: string) => {
    if (orderDetails[orderID]) {
      return; // Already fetched
    }

    setLoadingOrders({ ...loadingOrders, [orderID]: true });
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderID}`);
      const data = await response.json();
      setOrderDetails({ ...orderDetails, [orderID]: data });
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingOrders({ ...loadingOrders, [orderID]: false });
    }
  };

  const toggleExpand = async (orderID: string) => {
    const isExpanded = expandedOrders[orderID];
    
    if (!isExpanded) {
      await fetchOrderDetails(orderID);
    }
    
    setExpandedOrders({
      ...expandedOrders,
      [orderID]: !isExpanded,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900"
    >
      {children}
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <SortButton field="orderID">Order ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="dateOrder">Order Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="customerID">Customer ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="storeID">Store ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="orderStatus">Status</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No orders found. Try adjusting your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map((order) => (
                <>
                  <TableRow key={order.orderID} className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(order.orderID)}
                        className="p-0 h-8 w-8"
                      >
                        {expandedOrders[order.orderID] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{order.orderID}</TableCell>
                    <TableCell>
                      {new Date(order.dateOrder).toLocaleString()}
                    </TableCell>
                    <TableCell>{order.customerID}</TableCell>
                    <TableCell>{order.storeID}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Order Details */}
                  {expandedOrders[order.orderID] && (
                    <TableRow key={`${order.orderID}-details`}>
                      <TableCell colSpan={6} className="bg-gray-50 p-0">
                        <div className="p-6">
                          {loadingOrders[order.orderID] ? (
                            <div className="text-center py-4 text-gray-500">
                              Loading order details...
                            </div>
                          ) : orderDetails[order.orderID] ? (
                            <div>
                              <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Customer Name</p>
                                  <p className="text-gray-900">{orderDetails[order.orderID].customerName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Store Name</p>
                                  <p className="text-gray-900">{orderDetails[order.orderID].storeName}</p>
                                </div>
                              </div>
                              
                              <h4 className="text-gray-900 mb-3">Order Items</h4>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product Name</TableHead>
                                      <TableHead>Quantity</TableHead>
                                      <TableHead>Unit Price</TableHead>
                                      <TableHead>Line Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {orderDetails[order.orderID].itemList.map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>${item.lineTotal.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell colSpan={3} className="text-right">
                                        <strong>Total:</strong>
                                      </TableCell>
                                      <TableCell>
                                        <strong>
                                          $
                                          {orderDetails[order.orderID].itemList
                                            .reduce((sum, item) => sum + item.lineTotal, 0)
                                            .toFixed(2)}
                                        </strong>
                                      </TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              Failed to load order details.
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
