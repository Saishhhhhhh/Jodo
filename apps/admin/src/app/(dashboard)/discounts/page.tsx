'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi } from '@/lib/api-client';
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
import { DiscountSheet, type DiscountFormValues } from './discount-sheet';

type Discount = {
  _id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  usageCount: number;
};

export default function DiscountsPage() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      const res = await discountsApi.list();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DiscountFormValues) => discountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount created successfully');
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create discount');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountFormValues }) =>
      discountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount updated successfully');
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update discount');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete discount');
    },
  });

  const columns = useMemo<ColumnDef<Discount>[]>(() => [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return type.replace('_', ' ');
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const value = row.getValue('value') as number;
        if (type === 'percentage') return `${value}%`;
        if (type === 'fixed_amount') return `$${value}`;
        return 'N/A';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    { accessorKey: 'usageCount', header: 'Times Used' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const discount = row.original;
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
                  navigator.clipboard.writeText(discount.code);
                  toast.success('Code copied to clipboard');
                }}
              >
                Copy code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDiscount(discount);
                  setIsSheetOpen(true);
                }}
              >
                Edit discount
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this discount?')) {
                    deleteMutation.mutate(discount._id);
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

  const handleSubmit = (data: DiscountFormValues) => {
    if (selectedDiscount) {
      updateMutation.mutate({ id: selectedDiscount._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => {
          setSelectedDiscount(null);
          setIsSheetOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create Discount
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
      
      <DiscountSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        discount={selectedDiscount}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
