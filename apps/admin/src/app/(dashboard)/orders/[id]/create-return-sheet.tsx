'use client';

import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Package, RotateCcw } from 'lucide-react';

interface CreateReturnSheetProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SelectedItem = {
  productId?: string;
  sku: string;
  title: string;
  quantity: number;
  price: number;
  reason: 'defective' | 'wrong_item' | 'did_not_like' | 'size_mismatch' | 'other';
};

export function CreateReturnSheet({ order, open, onOpenChange }: CreateReturnSheetProps) {
  const queryClient = useQueryClient();
  
  // Selected items configuration state
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [refundAmount, setRefundAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setSelectedItems({});
      setRefundAmount(0);
      setNotes('');
    }
  }, [open]);

  // Automatically compute default refund amount based on selected items
  useEffect(() => {
    const total = Object.values(selectedItems).reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity);
    }, 0);
    setRefundAmount(total);
  }, [selectedItems]);

  const createMutation = useMutation({
    mutationFn: (data: any) => returnsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', order._id] });
      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
      toast.success('Return initiated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to initiate return');
    },
  });

  const handleToggleItem = (item: any, isChecked: boolean) => {
    const sku = item.sku;
    if (isChecked) {
      setSelectedItems(prev => ({
        ...prev,
        [sku]: {
          productId: item.productId?._id || item.productId,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          reason: 'size_mismatch', // default reason
        }
      }));
    } else {
      setSelectedItems(prev => {
        const copy = { ...prev };
        delete copy[sku];
        return copy;
      });
    }
  };

  const handleQtyChange = (sku: string, qty: number, maxQty: number) => {
    const val = Math.max(1, Math.min(qty, maxQty));
    setSelectedItems(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        quantity: val
      }
    }));
  };

  const handleReasonChange = (sku: string, reason: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        reason
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsArray = Object.values(selectedItems);
    
    if (itemsArray.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    createMutation.mutate({
      orderId: order._id,
      items: itemsArray,
      refundAmount,
      notes,
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: order.currency || 'INR' }).format(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[550px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <RotateCcw className="h-5 w-5" />
              <SheetTitle>Start a Return</SheetTitle>
            </div>
            <SheetDescription>
              Select returned products, quantities, reasons, and set refund totals for {order.orderNumber}.
            </SheetDescription>
          </SheetHeader>

          {/* Select Items List */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Select items to return</Label>
            
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => {
                const isSelected = !!selectedItems[item.sku];
                return (
                  <div key={idx} className={`p-4 border rounded-xl space-y-3 bg-card transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id={`chk-${item.sku}`} 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleToggleItem(item, checked === true)}
                          className="mt-1"
                        />
                        <div className="h-10 w-10 bg-muted rounded border flex items-center justify-center shrink-0 overflow-hidden">
                          {item.productId?.imageUrl ? (
                            <img src={item.productId.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <label htmlFor={`chk-${item.sku}`} className="font-semibold text-sm cursor-pointer line-clamp-1">
                            {item.title}
                          </label>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {item.sku}</p>
                          <p className="text-xs text-zinc-500 font-medium mt-1">Ordered quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right font-medium text-sm">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    {/* Return sub-fields shown only if item is selected */}
                    {isSelected && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed animate-in fade-in slide-in-from-top-1">
                        {/* Qty Selector */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Quantity to return</Label>
                          <Input 
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={selectedItems[item.sku].quantity}
                            onChange={(e) => handleQtyChange(item.sku, parseInt(e.target.value) || 1, item.quantity)}
                          />
                        </div>

                        {/* Reason Selector */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Reason</Label>
                          <Select 
                            value={selectedItems[item.sku].reason}
                            onValueChange={(val) => handleReasonChange(item.sku, val)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="size_mismatch">Size / Fit issue</SelectItem>
                              <SelectItem value="defective">Defective / Damaged</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                              <SelectItem value="did_not_like">Customer Disliked</SelectItem>
                              <SelectItem value="other">Other reason</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Refund Amount */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="refund" className="text-sm font-semibold">Refund amount ({order.currency || 'INR'})</Label>
            <div className="flex relative">
              <span className="absolute left-3 top-2.5 text-sm font-medium text-muted-foreground">{order.currency || 'INR'}</span>
              <Input 
                id="refund"
                type="number"
                min={0}
                className="pl-12"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Defaults to the subtotal of the selected return quantities.</p>
          </div>

          {/* Notes */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="notes" className="text-sm font-semibold">Reason for return / Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Returned for refund because customer bought the wrong size..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="border-t pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-primary text-white">
              {createMutation.isPending ? 'Submitting...' : 'Submit Return'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
