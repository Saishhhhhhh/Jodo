'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, User, DollarSign, RotateCcw } from 'lucide-react';

interface ReturnDetailsSheetProps {
  returnObj: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReturnDetailsSheet({ returnObj, open, onOpenChange }: ReturnDetailsSheetProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => 
      returnsApi.update(returnObj._id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
      toast.success('Return status updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update return status');
    },
  });

  if (!returnObj) return null;

  const handleUpdateStatus = (status: string) => {
    updateMutation.mutate({ status });
  };

  const getReasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      defective: 'Defective / Damaged',
      wrong_item: 'Wrong Item Sent',
      did_not_like: 'Customer Disliked Item',
      size_mismatch: 'Size / Fit Issue',
      other: 'Other Reason',
    };
    return map[reason] || reason;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'requested': return 'secondary';
      case 'approved': return 'outline';
      case 'received': return 'outline';
      case 'refunded': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2 text-primary">
            <RotateCcw className="h-5 w-5" />
            <SheetTitle>Return details — {returnObj.orderNumber}</SheetTitle>
          </div>
          <SheetDescription>
            Requested on {new Date(returnObj.createdAt).toLocaleDateString()}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status block */}
          <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(returnObj.status)} className="capitalize font-semibold">
                  {returnObj.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Refund Amount</span>
              <p className="font-bold text-lg mt-0.5">{formatCurrency(returnObj.refundAmount)}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-tight border-b pb-1">Customer</h4>
            <div className="flex gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{returnObj.customerName}</p>
                <p className="text-xs text-muted-foreground">{returnObj.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Returned items */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-tight border-b pb-1">Returned Items</h4>
            <div className="space-y-3">
              {returnObj.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between text-sm border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-muted rounded border flex items-center justify-center shrink-0 overflow-hidden">
                      {item.productId?.imageUrl ? (
                        <img src={item.productId.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">SKU: {item.sku}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] bg-zinc-100 font-medium text-zinc-700">
                        Reason: {getReasonLabel(item.reason)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right font-medium shrink-0">
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {returnObj.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold tracking-tight border-b pb-1">Merchant Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded border italic">
                {returnObj.notes}
              </p>
            </div>
          )}

          {/* Moderate workflow actions */}
          {returnObj.status !== 'refunded' && returnObj.status !== 'rejected' && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-semibold">Moderation Actions</h4>
              
              <div className="flex flex-col gap-2">
                {returnObj.status === 'requested' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus('rejected')}
                    >
                      Reject Return
                    </Button>
                    <Button 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus('approved')}
                    >
                      Approve Return
                    </Button>
                  </div>
                )}

                {returnObj.status === 'approved' && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={updateMutation.isPending}
                    onClick={() => handleUpdateStatus('received')}
                  >
                    Mark as Received
                  </Button>
                )}

                {returnObj.status === 'received' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={updateMutation.isPending}
                    onClick={() => handleUpdateStatus('refunded')}
                  >
                    Issue Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
