'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, returnsApi } from '@/lib/api-client';
import Link from 'next/link';
import { ArrowLeft, Package, CreditCard, Truck, User, MapPin, CheckCircle, FileText, Printer, RotateCcw, ShieldAlert, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FulfillOrderDialog } from './fulfill-order-dialog';
import { CreateReturnSheet } from './create-return-sheet';

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

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

  const returnActionMutation = useMutation({
    mutationFn: ({ returnId, status }: { returnId: string; status: string }) =>
      returnsApi.update(returnId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
      const label = variables.status === 'approved' ? 'accepted' : variables.status;
      toast.success(`Return request ${label} successfully`);
    },
    onError: () => toast.error('Failed to update return status'),
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

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      updateMutation.mutate({ status: 'cancelled' });
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
              {order.status === 'cancelled' && (
                <Badge variant="destructive" className="capitalize">
                  Cancelled
                </Badge>
              )}
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
        <div className="flex gap-2">
          {order.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={handleCancelOrder} className="flex items-center gap-1.5 font-medium text-destructive hover:bg-destructive/10">
              Cancel Order
            </Button>
          )}
          {order.fulfillmentStatus !== 'returned' && order.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={() => setIsReturnDialogOpen(true)} className="flex items-center gap-1.5 font-medium">
              <RotateCcw className="h-4 w-4" />
              Return Items
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (Left) */}
        <div className="md:col-span-2 space-y-6">

          {/* Return Request Banner & Actions if Return Exists */}
          {order.returnRequest && (
            <div className="border border-amber-500/30 rounded-xl bg-card shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Return Request</h3>
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(order.returnRequest.createdAt).toLocaleDateString()} • Refund: {formatCurrency(order.returnRequest.refundAmount)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`font-semibold capitalize ${
                  order.returnRequest.status === 'requested' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  order.returnRequest.status === 'approved' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  order.returnRequest.status === 'received' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                  order.returnRequest.status === 'refunded' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {order.returnRequest.status === 'requested' ? 'Pending Review' : order.returnRequest.status}
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {order.returnRequest.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    <span className="font-semibold text-foreground">Return Reason / Notes: </span>
                    "{order.returnRequest.notes}"
                  </div>
                )}

                {/* Workflow Actions right inside the Order */}
                {order.returnRequest.status === 'requested' && (
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                      disabled={returnActionMutation.isPending}
                      onClick={() => returnActionMutation.mutate({ returnId: order.returnRequest._id, status: 'approved' })}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Return
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-950/20"
                      disabled={returnActionMutation.isPending}
                      onClick={() => returnActionMutation.mutate({ returnId: order.returnRequest._id, status: 'rejected' })}
                    >
                      Reject Request
                    </Button>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Click <strong>Accept Return</strong> to approve pickup without rejecting.
                    </span>
                  </div>
                )}

                {order.returnRequest.status === 'approved' && (
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                      disabled={returnActionMutation.isPending}
                      onClick={() => returnActionMutation.mutate({ returnId: order.returnRequest._id, status: 'received' })}
                    >
                      <Package className="w-4 h-4" />
                      Mark Package as Received
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Return is accepted. Click once the item arrives at your warehouse.
                    </span>
                  </div>
                )}

                {order.returnRequest.status === 'received' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                        disabled={returnActionMutation.isPending}
                        onClick={() => returnActionMutation.mutate({ returnId: order.returnRequest._id, status: 'refunded' })}
                      >
                        <CreditCard className="w-4 h-4" />
                        Issue Refund ({formatCurrency(order.returnRequest.refundAmount)})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-500/30 text-rose-400 hover:bg-rose-950/20 font-medium"
                        disabled={returnActionMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to REJECT this refund? No money will be refunded to customer.')) {
                            returnActionMutation.mutate({ returnId: order.returnRequest._id, status: 'rejected' });
                          }
                        }}
                      >
                        ✕ Reject Refund
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Package received at warehouse. Click <strong>Issue Refund</strong> to pay back customer, or <strong>Reject Refund</strong> if items were damaged or invalid.
                    </p>
                  </div>
                )}

                {order.returnRequest.status === 'refunded' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Refund of {formatCurrency(order.returnRequest.refundAmount)} was processed. Return lifecycle complete.
                  </div>
                )}
              </div>
            </div>
          )}

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
                    <div className="flex items-center gap-3">
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
                      <span className="text-zinc-300">|</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => window.open(`/print-label/${order._id}`, '_blank')}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print Label
                      </Button>
                    </div>
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

          {/* Timeline Section */}
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Timeline
            </h3>
            <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
              
              {/* Payment Event */}
              {order.paymentStatus === 'paid' && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Payment of {formatCurrency(order.totalAmount)} was processed on the Visa ending in 4242.</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Placed Event */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Order was placed by {order.customerName}.</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

            </div>
          </div>
          
          {/* Tasks Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Tasks
              </h3>
              <Link href="/tasks/all-tasks">
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </div>
            <div className="border rounded-xl bg-card shadow-sm p-5 text-center">
              <p className="text-sm text-muted-foreground mb-4">No tasks linked to this order yet.</p>
              <Link href="/tasks/all-tasks">
                <Button size="sm">Create Task</Button>
              </Link>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-base">Customer</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {order.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <Link href="/customers" className="font-medium text-sm text-primary hover:underline block">
                  {order.customerName}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">0 orders</p>
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h4>
                <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">Edit</Button>
              </div>
              <div className="text-sm space-y-1 text-primary">
                <a href={`mailto:${order.customerEmail}`} className="hover:underline flex items-center gap-2">
                   {order.customerEmail}
                </a>
                {order.shippingAddress?.phone ? (
                  <a href={`tel:${order.shippingAddress.phone}`} className="hover:underline flex items-center gap-2 mt-2">
                     {order.shippingAddress.phone}
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">No phone number</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Shipping Address</h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">Edit</Button>
            </div>
            {order.shippingAddress ? (
              <address className="text-sm text-muted-foreground not-italic space-y-0.5">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="mt-2 text-primary">{order.shippingAddress.phone}</p>}
              </address>
            ) : (
              <p className="text-sm text-muted-foreground italic">No shipping address provided.</p>
            )}
          </div>

          {/* Billing Address Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Billing Address</h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">Edit</Button>
            </div>
            <p className="text-sm text-muted-foreground italic">Same as shipping address</p>
          </div>

          {/* Fraud Analysis Card */}
          <div className="border rounded-xl bg-card shadow-sm p-5">
            <h3 className="font-semibold text-base mb-3">Fraud Analysis</h3>
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${order.riskLevel === 'high' ? 'bg-red-100 text-red-600' : order.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {order.riskLevel === 'high' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground capitalize">{order.riskLevel || 'Low'} Risk</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.riskIndicators && order.riskIndicators.length > 0 
                    ? order.riskIndicators.map((i: any) => i.message).join(', ') 
                    : 'No indicators found. Low risk.'}
                </p>
              </div>
            </div>
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

      {order && (
        <CreateReturnSheet
          order={order}
          open={isReturnDialogOpen}
          onOpenChange={setIsReturnDialogOpen}
        />
      )}
    </div>
  );
}
