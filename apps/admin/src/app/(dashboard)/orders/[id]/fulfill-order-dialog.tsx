'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { Package, Truck, Navigation, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FulfillOrderDialogProps {
  orderId: string;
  items: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CARRIERS = [
  { id: 'fedex', name: 'FedEx' },
  { id: 'ups', name: 'UPS' },
  { id: 'usps', name: 'USPS' },
  { id: 'dhl', name: 'DHL' },
  { id: 'shiprocket', name: 'ShipRocket' },
  { id: 'custom', name: 'Custom Carrier' },
];

export function FulfillOrderDialog({ orderId, items, open, onOpenChange }: FulfillOrderDialogProps) {
  const queryClient = useQueryClient();
  
  const [carrier, setCarrier] = useState('fedex');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  const fulfillMutation = useMutation({
    mutationFn: (data: any) => ordersApi.fulfill(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      toast.success('Order fulfilled successfully');
      onOpenChange(false);
      
      // Reset form
      setCarrier('fedex');
      setTrackingNumber('');
      setTrackingUrl('');
      setNotifyCustomer(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to fulfill order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Tracking number is required');
      return;
    }
    
    fulfillMutation.mutate({
      carrier,
      trackingNumber,
      trackingUrl: carrier === 'custom' ? trackingUrl : undefined,
      notifyCustomer,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Fulfill Items
            </DialogTitle>
            <DialogDescription>
              Provide tracking information to fulfill the remaining items in this order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            
            {/* Items Summary */}
            <div className="bg-muted/30 border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-3">
              <h4 className="text-sm font-semibold mb-2">Items to fulfill ({items?.length || 0})</h4>
              {items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded border overflow-hidden shrink-0 flex items-center justify-center">
                      {item.productId?.imageUrl ? (
                        <img src={item.productId.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-muted-foreground text-xs">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="font-medium bg-background border px-2 py-1 rounded text-xs">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tracking Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shipping Carrier</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIERS.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input 
                    placeholder="e.g. 1Z9999999999999999" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {carrier === 'custom' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Tracking URL</Label>
                  <div className="flex relative">
                    <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="https://..." 
                      className="pl-9"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      required={carrier === 'custom'}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="notify" 
                checked={notifyCustomer}
                onCheckedChange={(c) => setNotifyCustomer(c === true)}
              />
              <label
                htmlFor="notify"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send shipment details to customer now
              </label>
            </div>
            
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={fulfillMutation.isPending}>
              {fulfillMutation.isPending ? 'Fulfilling...' : 'Fulfill items'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
