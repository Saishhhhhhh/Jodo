'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  fulfillments: any[];
  createdAt: string;
};

import Link from 'next/link';

const columns: ColumnDef<Order>[] = [
  { 
    accessorKey: 'orderNumber', 
    header: 'Order',
    cell: ({ row }) => (
      <span className="font-semibold">{row.getValue('orderNumber')}</span>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
  { accessorKey: 'customerName', header: 'Customer' },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;
      return (
        <Badge
          variant={status === 'paid' ? 'default' : status === 'refunded' ? 'destructive' : 'secondary'}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fulfillmentStatus',
    header: 'Fulfillment',
    cell: ({ row }) => {
      const status = row.getValue('fulfillmentStatus') as string;
      return (
        <Badge
          variant={status === 'fulfilled' ? 'default' : 'secondary'}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'tracking',
    header: 'Tracking',
    cell: ({ row }) => {
      const fulfillments = row.original.fulfillments;
      if (!fulfillments || fulfillments.length === 0) return <span className="text-muted-foreground">—</span>;
      
      const latest = fulfillments[fulfillments.length - 1];
      if (latest.trackingUrl) {
        return (
          <a 
            href={latest.trackingUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {latest.trackingNumber}
          </a>
        );
      }
      return <span>{latest.trackingNumber}</span>;
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return formatted;
    },
  },
];

import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.list();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer orders</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading} 
        onRowClick={(row) => router.push(`/orders/${row._id}`)}
      />
    </div>
  );
}
