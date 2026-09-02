'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { CampaignSheet, type CampaignFormValues } from './campaign-sheet';
import { Campaign } from '@jodo/shared';

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await campaignsApi.list();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CampaignFormValues) => campaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create campaign');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignFormValues }) =>
      campaignsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update campaign');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete campaign');
    },
  });

  const columns = useMemo<ColumnDef<Campaign>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue('type')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
        if (status === 'active') variant = 'default';
        if (status === 'scheduled') variant = 'secondary';
        
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget / Spend',
      cell: ({ row }) => {
        const budget = row.getValue('budget') as number;
        const spend = row.original.spend || 0;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formatCurrency(spend, 'USD')}</span>
            {budget > 0 && <span className="text-xs text-muted-foreground">of {formatCurrency(budget, 'USD')}</span>}
          </div>
        );
      },
    },
    {
      id: 'performance',
      header: 'Performance',
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        return (
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>{metrics?.impressions || 0} Imp.</span>
            <span>{metrics?.clicks || 0} Clicks</span>
            <span>{metrics?.conversions || 0} Conv.</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setIsSheetOpen(true);
                }}
              >
                Edit campaign
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this campaign?')) {
                    deleteMutation.mutate(campaign._id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [deleteMutation]);

  const handleSubmit = (data: CampaignFormValues) => {
    if (selectedCampaign) {
      updateMutation.mutate({ id: selectedCampaign._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your marketing campaigns and track performance</p>
        </div>
        <Button onClick={() => {
          setSelectedCampaign(null);
          setIsSheetOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
      
      <CampaignSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        campaign={selectedCampaign}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
