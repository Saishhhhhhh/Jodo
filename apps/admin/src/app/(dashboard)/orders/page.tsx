'use client';

import { useState, useMemo } from 'react';
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
  Truck, 
  AlertCircle, 
  Edit, 
  Package,
  Printer,
  MapPin,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FulfillOrderDialog } from './[id]/fulfill-order-dialog';

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  fulfillments: any[];
  items: any[];
  createdAt: string;
  status?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
};

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.list();
      return res.data.data as Order[];
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
    { 
      accessorKey: 'customerName', 
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('customerName')}</span>
          {row.original.shippingAddress?.city && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              {row.original.shippingAddress.city}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'city',
      header: 'City',
      cell: ({ row }) => {
        const shipping = row.original.shippingAddress;
        const city = shipping?.city;
        const state = shipping?.state;
        if (!city) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span>{city}</span>
            {state && <span className="text-xs text-muted-foreground font-normal">({state})</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        const status = row.getValue('paymentStatus') as string;
        const orderStatus = row.original.status as string;
        if (orderStatus === 'cancelled') {
          return <Badge variant="destructive">Cancelled</Badge>;
        }
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
        const orderStatus = row.original.status as string;
        if (orderStatus === 'cancelled') {
          return <span className="text-muted-foreground">—</span>;
        }
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
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {latest.trackingNumber}
            </a>
          );
        }
        return <span className="font-mono text-xs">{latest.trackingNumber}</span>;
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
                  <Edit className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                
                {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, paymentStatus: 'paid' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                  </DropdownMenuItem>
                )}
                
                {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                  <DropdownMenuItem 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, paymentStatus: 'refunded' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" /> Refund Payment
                  </DropdownMenuItem>
                )}

                {order.fulfillmentStatus !== 'fulfilled' && order.status !== 'cancelled' && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsFulfillDialogOpen(true);
                    }}
                  >
                    <Truck className="mr-2 h-4 w-4" /> Fulfill Order
                  </DropdownMenuItem>
                )}

                {order.fulfillmentStatus === 'fulfilled' && order.status !== 'cancelled' && (
                  <DropdownMenuItem onClick={() => window.open(`/print-label/${order._id}`, '_blank')}>
                    <Printer className="mr-2 h-4 w-4" /> Print Shipping Label
                  </DropdownMenuItem>
                )}
                
                {order.status !== 'cancelled' && (
                  <DropdownMenuItem 
                    className="text-destructive hover:text-destructive focus:text-destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        ordersApi.update(order._id, { status: 'cancelled' })
                          .then(() => {
                            queryClient.invalidateQueries({ queryKey: ['orders'] });
                            toast.success('Order cancelled successfully');
                          })
                          .catch(() => toast.error('Failed to cancel order'));
                      }
                    }}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter((o: Order) => 
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q) ||
      o.shippingAddress?.state?.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-72 bg-card rounded-md border px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order, customer, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredOrders} 
        isLoading={isLoading} 
        onRowClick={(row) => router.push(`/orders/${row._id}`)}
      />

      {selectedOrder && (
        <FulfillOrderDialog
          orderId={selectedOrder._id}
          items={selectedOrder.items}
          open={isFulfillDialogOpen}
          onOpenChange={(open) => {
            setIsFulfillDialogOpen(open);
            if (!open) {
              setSelectedOrder(null);
              queryClient.invalidateQueries({ queryKey: ['orders'] });
            }
          }}
        />
      )}
    </div>
  );
}
