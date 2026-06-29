'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, storeApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Award, Star, Settings2, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CustomersLoyaltyPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [pointsPerCurrency, setPointsPerCurrency] = useState('');
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const { data: storeData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.list();
      return res.data.data;
    },
  });

  const settings = storeData?.settings || {};
  const loyaltySettings = settings.loyalty || { isEnabled: false, pointsPerCurrency: 1 };
  const currency = storeData?.defaultCurrency || 'INR';

  const updateStoreMutation = useMutation({
    mutationFn: async (newLoyaltySettings: any) => {
      const newSettings = {
        ...settings,
        loyalty: newLoyaltySettings,
      };
      return storeApi.update({ settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Loyalty settings updated');
      setIsEditingSettings(false);
    },
    onError: () => {
      toast.error('Failed to update loyalty settings');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, loyaltyPoints }: { id: string; loyaltyPoints: number }) => 
      customersApi.update(id, { loyaltyPoints }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Loyalty points updated successfully');
      setIsDialogOpen(false);
      setAdjustmentAmount('');
    },
    onError: () => {
      toast.error('Failed to update loyalty points');
    },
  });

  const handleToggleLoyalty = (checked: boolean) => {
    updateStoreMutation.mutate({ ...loyaltySettings, isEnabled: checked });
  };

  const handleSaveSettings = () => {
    const points = parseFloat(pointsPerCurrency);
    if (isNaN(points) || points <= 0) {
      toast.error('Please enter a valid points multiplier');
      return;
    }
    updateStoreMutation.mutate({ ...loyaltySettings, pointsPerCurrency: points });
  };

  const handleAdjustPoints = () => {
    if (!selectedCustomer) return;
    const amount = parseInt(adjustmentAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    const currentPoints = selectedCustomer.loyaltyPoints || 0;
    const newPoints = adjustmentType === 'add' 
      ? currentPoints + amount 
      : Math.max(0, currentPoints - amount);

    updateCustomerMutation.mutate({ id: selectedCustomer._id, loyaltyPoints: newPoints });
  };

  // Sort customers by loyalty points (descending)
  const topCustomers = customers ? [...customers].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0)) : [];
  const totalPointsIssued = customers?.reduce((acc: number, c: any) => acc + (c.loyaltyPoints || 0), 0) || 0;

  const columns: ColumnDef<any>[] = [
    {
      id: 'rank',
      header: 'Rank',
      cell: ({ row }) => {
        const index = row.index;
        if (index === 0) return <Award className="h-6 w-6 text-yellow-500" />;
        if (index === 1) return <Award className="h-6 w-6 text-gray-400" />;
        if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
        return <span className="text-muted-foreground ml-2">#{index + 1}</span>;
      }
    },
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
      accessorKey: 'loyaltyPoints',
      header: 'Points Balance',
      cell: ({ row }) => (
        <span className="font-semibold flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          {row.original.loyaltyPoints || 0}
        </span>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedCustomer(row.original);
              setAdjustmentType('add');
              setIsDialogOpen(true);
            }}
          >
            Adjust Points
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Reward your best customers and build long-term retention.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Settings Card */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-4 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Program Settings</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {loyaltySettings.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Switch 
                  checked={loyaltySettings.isEnabled} 
                  onCheckedChange={handleToggleLoyalty} 
                  disabled={updateStoreMutation.isPending}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-1">Earning Rules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define how many points a customer earns for every unit of currency spent.
                </p>
                {isEditingSettings ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={pointsPerCurrency} 
                      onChange={(e) => setPointsPerCurrency(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">points per 1 {currency}</span>
                    <Button size="sm" onClick={handleSaveSettings} disabled={updateStoreMutation.isPending}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingSettings(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{loyaltySettings.pointsPerCurrency} points</span>
                      <span className="text-muted-foreground text-sm">per 1 {currency} spent</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      setPointsPerCurrency(loyaltySettings.pointsPerCurrency.toString());
                      setIsEditingSettings(true);
                    }}>Edit</Button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-1">Automation (Phase 0)</h3>
                <p className="text-sm text-muted-foreground">
                  Currently, points are manually managed via the dashboard. In the future, points will be automatically awarded upon order fulfillment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="p-4 bg-yellow-500/10 rounded-full mb-2">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Points Issued</p>
            <h2 className="text-4xl font-bold">{totalPointsIssued.toLocaleString()}</h2>
            <p className="text-xs text-muted-foreground">across all active members</p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-xl bg-card shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Loyalty Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Your top customers ranked by points balance.</p>
        </div>
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={topCustomers} 
            isLoading={isLoadingCustomers} 
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Loyalty Points</DialogTitle>
            <DialogDescription>
              Manage points for {selectedCustomer?.firstName} {selectedCustomer?.lastName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed">
              <span className="text-sm text-muted-foreground mb-1">Current Points</span>
              <span className="text-3xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                {selectedCustomer?.loyaltyPoints || 0}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 p-1 bg-muted rounded-md w-full">
                <Button 
                  variant={adjustmentType === 'add' ? 'default' : 'ghost'} 
                  className="w-1/2 h-8 text-xs font-medium"
                  onClick={() => setAdjustmentType('add')}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Points
                </Button>
                <Button 
                  variant={adjustmentType === 'remove' ? 'default' : 'ghost'} 
                  className="w-1/2 h-8 text-xs font-medium"
                  onClick={() => setAdjustmentType('remove')}
                >
                  <Minus className="w-3.5 h-3.5 mr-1" /> Remove Points
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Points to {adjustmentType === 'add' ? 'add' : 'remove'}
                </label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="0" 
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustPoints} disabled={updateCustomerMutation.isPending || !adjustmentAmount}>
              {updateCustomerMutation.isPending ? 'Saving...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
