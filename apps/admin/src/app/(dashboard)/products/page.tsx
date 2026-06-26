'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Product = {
  _id: string;
  title: string;
  sku: string;
  price: number;
  inventoryQuantity: number;
  status: string;
  category: string;
};

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'inventoryQuantity',
    header: 'Inventory',
    cell: ({ row }) => {
      const qty = row.getValue('inventoryQuantity') as number;
      return <span className={qty === 0 ? 'text-destructive' : ''}>{qty} in stock</span>;
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(price);
      return formatted;
    },
  },
];

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your catalog</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </div>
  );
}
