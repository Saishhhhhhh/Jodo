'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  CreditCard, 
  AlertCircle, 
  Edit,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  fulfillments: any[];
  items: any[];
  createdAt: string;
  status?: string;
};

export default function DraftOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'draft'],
    queryFn: async () => {
      // Pass status=draft if the API supports it, or filter locally if not yet supported
      const res = await ordersApi.list({ status: 'draft' });
      // In case the backend doesn't filter yet, we filter on the frontend for safety
      return res.data.data.filter((o: Order) => o.status === 'draft');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) => 
      ordersApi.update(id, { paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const columns: ColumnDef<Order>[] = [
    { 
      accessorKey: 'orderNumber', 
      header: 'Draft Order',
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
      header: 'Status',
      cell: () => {
        return <Badge variant="secondary">Draft</Badge>;
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
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/orders/${order._id}`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Draft
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="text-destructive hover:text-destructive focus:text-destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this draft order?')) {
                      ordersApi.update(order._id, { status: 'cancelled' })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['orders'] });
                          toast.success('Draft order deleted successfully');
                        })
                        .catch(() => toast.error('Failed to delete draft order'));
                    }
                  }}
                >
                  <AlertCircle className="mr-2 h-4 w-4" /> Delete Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Draft Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your draft orders and invoices</p>
        </div>
        <Button onClick={() => router.push('/orders/draft/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Draft Order
        </Button>
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
