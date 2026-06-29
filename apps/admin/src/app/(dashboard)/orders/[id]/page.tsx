'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import Link from 'next/link';
import { ArrowLeft, Package, CreditCard, Truck, User, MapPin, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FulfillOrderDialog } from './fulfill-order-dialog';

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await ordersApi.get(id);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ordersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success('Order updated successfully');
      setEditingNotes(false);
    },
    onError: () => toast.error('Failed to update order'),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-destructive">Order not found.</div>;
  }

  const handleMarkAsPaid = () => {
    updateMutation.mutate({ paymentStatus: 'paid' });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({ notes: notesValue });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: order.currency || 'INR' }).format(val);
  };

  return (
    <div className="p-6 animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">
              {order.paymentStatus}
            </Badge>
            <Badge variant={order.fulfillmentStatus === 'fulfilled' ? 'default' : 'secondary'} className="capitalize">
              {order.fulfillmentStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (Left) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Fulfillment Card */}
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">{order.fulfillmentStatus === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled'}</h2>
              </div>
              {order.fulfillmentStatus !== 'fulfilled' && (
                <Button size="sm" onClick={() => setIsFulfillDialogOpen(true)}>
                  Fulfill Order
                </Button>
              )}
            </div>
            
            {order.fulfillments && order.fulfillments.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border-b p-4 space-y-3">
                {order.fulfillments.map((fulfillment: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium">Fulfilled</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground capitalize">{fulfillment.carrier}</span>
                    </div>
                    {fulfillment.trackingUrl ? (
                      <a 
                        href={fulfillment.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        {fulfillment.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-medium">{fulfillment.trackingNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {item.productId?.imageUrl ? (
                              <img src={item.productId.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Card */}
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">{order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}</h2>
              </div>
              {order.paymentStatus !== 'paid' && (
                <Button size="sm" onClick={handleMarkAsPaid} disabled={updateMutation.isPending}>
                  Mark as Paid
                </Button>
              )}
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Subtotal ({order.itemsCount} items)</span>
                <span>{formatCurrency(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(order.taxTotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingTotal || 0)}</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center font-semibold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          
          {/* Notes Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Notes</h3>
              </div>
              {!editingNotes && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-muted-foreground"
                  onClick={() => {
                    setNotesValue(order.notes || '');
                    setEditingNotes(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea 
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add a note to this order..."
                  className="text-sm min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveNotes} disabled={updateMutation.isPending}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {order.notes || 'No notes for this order.'}
              </p>
            )}
          </div>

          {/* Customer Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Customer</h3>
              </div>
            </div>
            <div>
              <Link href="/customers" className="font-medium text-sm text-primary hover:underline block">
                {order.customerName}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">{order.customerEmail}</p>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Shipping Address</h3>
            </div>
            {order.shippingAddress ? (
              <address className="text-sm text-muted-foreground not-italic space-y-0.5">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-muted-foreground italic">No shipping address provided.</p>
            )}
          </div>

        </div>
      </div>
      
      {order && (
        <FulfillOrderDialog 
          orderId={order._id}
          items={order.items}
          open={isFulfillDialogOpen}
          onOpenChange={setIsFulfillDialogOpen}
        />
      )}
    </div>
  );
}
