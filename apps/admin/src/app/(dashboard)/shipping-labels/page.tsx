'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Truck, Package } from 'lucide-react';
import { FulfillOrderDialog } from '../orders/[id]/fulfill-order-dialog';

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemsCount: number;
  items: any[];
  createdAt: string;
};

export default function ShippingLabelsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['orders-shipping'],
    queryFn: async () => {
      const res = await ordersApi.list();
      // Filter out fully fulfilled orders so we only see ones that need shipping
      const allOrders = res.data.data;
      return allOrders.filter((o: any) => o.fulfillmentStatus !== 'fulfilled');
    },
  });

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
      accessorKey: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Package className="h-4 w-4" />
          {row.getValue('itemsCount')}
        </div>
      ),
    },
    {
      accessorKey: 'fulfillmentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('fulfillmentStatus') as string;
        return (
          <Badge variant={status === 'unfulfilled' ? 'destructive' : 'secondary'} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedOrder(order);
                setIsFulfillDialogOpen(true);
              }}
            >
              Create Label
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipping Labels</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage orders that are ready to ship</p>
        </div>
      </div>

      {data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-xl bg-card py-24 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-muted-foreground max-w-[400px]">
            You have no unfulfilled orders at the moment. When customers place new orders, they will appear here ready to ship.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => router.push('/orders')}>
            View All Orders
          </Button>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={data || []} 
          isLoading={isLoading} 
          onRowClick={(row) => router.push(`/orders/${row._id}`)}
        />
      )}

      {selectedOrder && (
        <FulfillOrderDialog
          orderId={selectedOrder._id}
          items={selectedOrder.items}
          open={isFulfillDialogOpen}
          onOpenChange={(open) => {
            setIsFulfillDialogOpen(open);
            if (!open) {
              setSelectedOrder(null);
              // Invalidate both lists to ensure data consistency
              queryClient.invalidateQueries({ queryKey: ['orders-shipping'] });
              queryClient.invalidateQueries({ queryKey: ['orders'] });
            }
          }}
        />
      )}
    </div>
  );
}
