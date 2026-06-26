'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

type InventoryItem = {
  _id: string;
  sku: string;
  locationName: string;
  onHand: number;
  available: number;
  committed: number;
  status: string;
};

const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'locationName', header: 'Location' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'in_stock'
              ? 'default'
              : status === 'low_stock'
              ? 'destructive'
              : 'secondary'
          }
        >
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  { accessorKey: 'available', header: 'Available' },
  { accessorKey: 'committed', header: 'Committed' },
  { accessorKey: 'onHand', header: 'On Hand' },
];

export default function InventoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await inventoryApi.list();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track stock levels across locations</p>
        </div>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </div>
  );
}
