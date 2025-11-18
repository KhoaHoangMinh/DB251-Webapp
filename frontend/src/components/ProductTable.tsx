import { useState } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Product {
  id: string;
  productId: string;
  productName: string;
  category: string;
  description: string;
  price: number;
  stockQuantity: number;
  supplier: string;
  sku: string;
  dateAdded: string;
  status: 'Active' | 'Discontinued';
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

type SortField = 'productId' | 'productName' | 'category' | 'price' | 'stockQuantity' | 'dateAdded';
type SortOrder = 'asc' | 'desc';

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('productId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'price' || sortField === 'stockQuantity') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
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
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="productId">Product ID</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="productName">Product Name</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="category">Category</SortButton>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <SortButton field="price">Price</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="stockQuantity">Stock</SortButton>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>
                  <SortButton field="dateAdded">Date Added</SortButton>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No products found. Try adjusting your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stockQuantity < 50 ? 'text-orange-600' : ''}>
                        {product.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {new Date(product.dateAdded).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(product)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
