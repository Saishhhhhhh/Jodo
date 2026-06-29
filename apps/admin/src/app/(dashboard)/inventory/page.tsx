'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Search, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type InventoryItem = {
  _id: string;
  sku: string;
  locationName: string;
  onHand: number;
  available: number;
  committed: number;
  status: string;
  product?: {
    title: string;
    imageUrl?: string;
    category?: string;
    vendor?: string;
  } | null;
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableInput, setAvailableInput] = useState(0);
  const [committedInput, setCommittedInput] = useState(0);

  // Fetch inventory
  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await inventoryApi.list();
      return res.data.data;
    },
  });

  // Update inventory mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, available, committed }: { id: string; available: number; committed: number }) =>
      inventoryApi.update(id, { available, committed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsDialogOpen(false);
      toast.success('Stock levels updated successfully');
    },
    onError: () => {
      toast.error('Failed to update stock levels');
    },
  });

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setAvailableInput(item.available);
    setCommittedInput(item.committed);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedItem) return;
    updateMutation.mutate({
      id: selectedItem._id,
      available: availableInput,
      committed: committedInput,
    });
  };

  // Filter items
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (item: InventoryItem) =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.product?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => {
          const item = row.original;
          const prod = item.product;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {prod?.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{prod?.title || 'Unknown Product'}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  SKU: <span className="font-mono">{item.sku}</span> {prod?.vendor ? `• ${prod.vendor}` : ''}
                </span>
              </div>
            </div>
          );
        },
      },
      { accessorKey: 'locationName', header: 'Location' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          let badgeVariant: 'default' | 'secondary' | 'outline' = 'secondary';
          let customClass = '';

          if (status === 'in_stock') {
            badgeVariant = 'default';
            customClass = 'bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none';
          } else if (status === 'low_stock') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none';
          } else if (status === 'out_of_stock') {
            badgeVariant = 'outline';
            customClass = 'bg-destructive/10 text-destructive border-none';
          }

          return (
            <Badge variant={badgeVariant} className={`text-xs capitalize font-medium ${customClass}`}>
              {status.replace('_', ' ')}
            </Badge>
          );
        },
      },
      { 
        accessorKey: 'available', 
        header: 'Available',
        cell: ({ row }) => {
          const val = row.getValue('available') as number;
          return <span className="font-mono font-medium">{val}</span>;
        }
      },
      { 
        accessorKey: 'committed', 
        header: 'Committed',
        cell: ({ row }) => {
          const val = row.getValue('committed') as number;
          return <span className="font-mono text-muted-foreground">{val}</span>;
        }
      },
      { 
        accessorKey: 'onHand', 
        header: 'On Hand',
        cell: ({ row }) => {
          const val = row.getValue('onHand') as number;
          return <span className="font-mono font-semibold">{val}</span>;
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => handleEditClick(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and update stock levels across locations</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md bg-card rounded-md border px-3 py-1.5 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by Product, SKU or Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <DataTable columns={columns} data={filteredData} isLoading={isLoading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update inventory levels for <span className="font-semibold">{selectedItem?.product?.title || 'product'}</span> (SKU: {selectedItem?.sku}) at{' '}
              <span className="font-semibold">{selectedItem?.locationName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available">Available Quantity</Label>
                <Input
                  id="available"
                  type="number"
                  min="0"
                  value={availableInput}
                  onChange={(e) => setAvailableInput(parseInt(e.target.value, 10) || 0)}
                />
                <p className="text-[10px] text-muted-foreground">Available to sell online</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="committed">Committed Quantity</Label>
                <Input
                  id="committed"
                  type="number"
                  min="0"
                  value={committedInput}
                  onChange={(e) => setCommittedInput(parseInt(e.target.value, 10) || 0)}
                />
                <p className="text-[10px] text-muted-foreground">Reserved for active orders</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">New Calculated On-Hand:</span>
              <span className="font-bold text-sm font-mono">{availableInput + committedInput} total units</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
