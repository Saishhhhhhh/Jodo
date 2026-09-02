'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, storeApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Wallet, Plus, Minus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CustomersWalletsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  const { data: storeData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });
  const currency = storeData?.defaultCurrency || 'INR';

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.list();
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, walletBalance }: { id: string; walletBalance: number }) => 
      customersApi.update(id, { walletBalance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Wallet balance updated successfully');
      setIsDialogOpen(false);
      setAdjustmentAmount('');
    },
    onError: () => {
      toast.error('Failed to update wallet balance');
    },
  });

  const handleAdjustBalance = () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    const currentBalance = selectedCustomer.walletBalance || 0;
    const newBalance = adjustmentType === 'add' 
      ? currentBalance + amount 
      : Math.max(0, currentBalance - amount);

    updateMutation.mutate({ id: selectedCustomer._id, walletBalance: newBalance });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(val);
  };

  const filteredCustomers = customers?.filter((c: any) => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalIssued = customers?.reduce((acc: number, c: any) => acc + (c.walletBalance || 0), 0) || 0;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      )
    },
    {
      accessorKey: 'walletBalance',
      header: 'Wallet Balance',
      cell: ({ row }) => (
        <span className="font-semibold text-lg">
          {formatCurrency(row.original.walletBalance || 0)}
        </span>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedCustomer(row.original);
              setAdjustmentType('add');
              setIsDialogOpen(true);
            }}
          >
            Manage Balance
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Wallets</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage store credit and digital wallets for your customers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-xl bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Total Credit Issued</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalIssued)}</p>
          <p className="text-sm text-muted-foreground mt-1">Across {customers?.filter((c: any) => c.walletBalance > 0).length || 0} customers</p>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-9 bg-muted/50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={filteredCustomers} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Wallet Balance</DialogTitle>
            <DialogDescription>
              Adjust store credit for {selectedCustomer?.firstName} {selectedCustomer?.lastName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed">
              <span className="text-sm text-muted-foreground mb-1">Current Balance</span>
              <span className="text-3xl font-bold">{formatCurrency(selectedCustomer?.walletBalance || 0)}</span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 p-1 bg-muted rounded-md w-full">
                <Button 
                  variant={adjustmentType === 'add' ? 'default' : 'ghost'} 
                  className="w-1/2 h-8 text-xs font-medium"
                  onClick={() => setAdjustmentType('add')}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Funds
                </Button>
                <Button 
                  variant={adjustmentType === 'remove' ? 'default' : 'ghost'} 
                  className="w-1/2 h-8 text-xs font-medium"
                  onClick={() => setAdjustmentType('remove')}
                >
                  <Minus className="w-3.5 h-3.5 mr-1" /> Remove Funds
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Amount to {adjustmentType === 'add' ? 'add' : 'remove'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00" 
                    className="pl-7"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustBalance} disabled={updateMutation.isPending || !adjustmentAmount}>
              {updateMutation.isPending ? 'Saving...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
