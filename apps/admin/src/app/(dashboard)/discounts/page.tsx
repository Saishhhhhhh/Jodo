'use client';

import { useQuery } from '@tanstack/react-query';
import { discountsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Discount = {
  _id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  usageCount: number;
};

const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('code')}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return type.replace('_', ' ');
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const value = row.getValue('value') as number;
      if (type === 'percentage') return `${value}%`;
      if (type === 'fixed_amount') return `$${value}`;
      return 'N/A';
    },
  },
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
  { accessorKey: 'usageCount', header: 'Times Used' },
];

export default function DiscountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      const res = await discountsApi.list();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage discount codes and promotions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Discount
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </div>
  );
}
