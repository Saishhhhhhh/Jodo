'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersApi, customersApi, productsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateDraftOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.list();
      return res.data.data;
    },
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data.data;
    },
  });

  const customers = customersData || [];
  const products = productsData || [];

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Draft order created successfully');
      router.push('/orders/draft');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create draft order');
    },
  });

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      return toast.error('Please select a customer');
    }

    if (orderItems.length === 0 || orderItems.some(item => !item.productId || item.quantity < 1)) {
      return toast.error('Please add valid items to the order');
    }

    const customer = customers.find((c: any) => c._id === selectedCustomerId);
    
    // Map selected product IDs to full item details expected by the API
    const items = orderItems.map(item => {
      const product = products.find((p: any) => p._id === item.productId);
      return {
        productId: product._id,
        sku: product.sku || product.handle || 'N/A',
        title: product.title,
        quantity: Number(item.quantity),
        price: product.price,
      };
    });

    createOrderMutation.mutate({
      customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
      customerEmail: customer?.email,
      items,
      shippingAddress: customer?.addresses?.[0] || undefined,
    });
  };

  // Calculate Subtotal visually
  const subtotal = orderItems.reduce((acc, item) => {
    const product = products.find((p: any) => p._id === item.productId);
    if (product) {
      return acc + (product.price * (item.quantity || 1));
    }
    return acc;
  }, 0);

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Draft Order</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add products and assign a customer to create a draft</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Selection */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <div className="grid gap-2">
            <Label>Select Customer</Label>
            <Select 
              value={selectedCustomerId} 
              onValueChange={setSelectedCustomerId}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer: any) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
              No items added to this draft yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-2">
                    <Label>Product</Label>
                    <Select 
                      value={item.productId} 
                      onValueChange={(val) => handleItemChange(index, 'productId', val)}
                      disabled={isLoadingProducts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.title} - ₹{product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} 
                    />
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Totals Summary */}
          {orderItems.length > 0 && (
            <div className="flex justify-end pt-4 border-t mt-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createOrderMutation.isPending || orderItems.length === 0 || !selectedCustomerId}>
            {createOrderMutation.isPending ? 'Saving...' : 'Save Draft Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
