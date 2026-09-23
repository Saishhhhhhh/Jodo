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
import { Package, User, RotateCcw, AlertTriangle, MessageSquare, Landmark } from 'lucide-react';

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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      requested: { 
        label: 'Pending Review', 
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
      },
      approved: { 
        label: 'Approved', 
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
      },
      received: { 
        label: 'Received', 
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
      },
      refunded: { 
        label: 'Refunded', 
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
      },
      rejected: { 
        label: 'Rejected', 
        className: 'bg-destructive/15 text-destructive border-destructive/20' 
      },
    };
    return configs[status] || { label: status, className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const statusInfo = getStatusConfig(returnObj.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto bg-background p-0 border-l border-zinc-800">
        
        {/* Sticky Header block with a premium back-tint */}
        <div className="p-6 border-b border-zinc-800 bg-muted/20">
          <SheetHeader className="space-y-1.5">
            <div className="flex items-center gap-2.5 text-primary">
              <RotateCcw className="h-5 w-5 text-indigo-400" />
              <SheetTitle className="text-xl font-bold tracking-tight">Return details — {returnObj.orderNumber}</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Return request initiated on {new Date(returnObj.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Refund Overview Grid */}
          <div className="grid grid-cols-2 gap-4 bg-muted/30 border border-zinc-800 p-4 rounded-xl shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Review Status</span>
              <div className="pt-0.5">
                <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 text-xs capitalize ${statusInfo.className}`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-0.5 text-right border-l border-zinc-800/80 pl-4">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center justify-end gap-1">
                <Landmark className="h-3 w-3 text-zinc-500" />
                Refund Total
              </span>
              <p className="font-extrabold text-xl tracking-tight text-emerald-400">{formatCurrency(returnObj.refundAmount)}</p>
            </div>
          </div>

          {/* Customer info card */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Contact</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/60 bg-muted/10">
              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm">{returnObj.customerName}</p>
                <p className="text-xs text-muted-foreground font-mono">{returnObj.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Returned items lists */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Returned Products</h4>
            <div className="border border-zinc-800/60 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
              {returnObj.items?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.productId?.imageUrl ? (
                        <img src={item.productId.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-sm line-clamp-1 leading-snug">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</p>
                      
                      <div className="pt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span className="text-[11px] text-amber-400/90 font-medium">
                          {getReasonLabel(item.reason)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-bold text-sm">{formatCurrency(item.price)}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/60 rounded">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes bubble */}
          {returnObj.notes && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Return Reason & Notes</h4>
              <div className="flex gap-3 p-4 rounded-xl border border-zinc-800/60 bg-muted/10 text-sm italic text-zinc-300">
                <MessageSquare className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">"{returnObj.notes}"</p>
              </div>
            </div>
          )}

          {/* Moderate workflow actions block */}
          {returnObj.status !== 'refunded' && returnObj.status !== 'rejected' && (
            <div className="pt-2">
              <div className="bg-muted/30 border border-zinc-800 p-4 rounded-xl space-y-3.5 shadow-inner">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fulfillment Actions</h4>
                  <p className="text-[11px] text-zinc-500">Advance the return through standard warehouse receiving protocols.</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {returnObj.status === 'requested' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 font-medium"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this return request?')) {
                            handleUpdateStatus('rejected');
                          }
                        }}
                      >
                        ✕ Reject Request
                      </Button>
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdateStatus('approved')}
                      >
                        ✓ Accept Return
                      </Button>
                    </div>
                  )}

                  {returnObj.status === 'approved' && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm transition-all py-5"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdateStatus('received')}
                      >
                        Mark as Received
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this approved return?')) {
                            handleUpdateStatus('rejected');
                          }
                        }}
                      >
                        ✕ Reject Return Instead
                      </Button>
                    </div>
                  )}

                  {returnObj.status === 'received' && (
                    <div className="space-y-2.5">
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all py-5"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdateStatus('refunded')}
                      >
                        ✓ Issue Refund ({formatCurrency(returnObj.refundAmount)})
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 font-medium py-4 text-xs"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to REJECT this refund? No money will be refunded to customer.')) {
                            handleUpdateStatus('rejected');
                          }
                        }}
                      >
                        ✕ Reject Refund (Deny Refund & Keep Payment)
                      </Button>
                      <p className="text-[11px] text-zinc-500 text-center">
                        If goods are damaged or unverified, clicking <strong>Reject Refund</strong> cancels the refund and keeps customer payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
