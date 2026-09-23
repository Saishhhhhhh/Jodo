'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { returnsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Package, HelpCircle, Eye, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { ReturnDetailsSheet } from './return-details-sheet';
import { toast } from 'sonner';

type Return = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
  refundAmount: number;
  createdAt: string;
};

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: returnsData, isLoading } = useQuery({
    queryKey: ['returns-list'],
    queryFn: async () => {
      const res = await returnsApi.list();
      return res.data.data as Return[];
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="secondary" className="capitalize bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="capitalize bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Approved</Badge>;
      case 'received':
        return <Badge variant="secondary" className="capitalize bg-purple-500/10 text-purple-600 border-purple-500/20">Package Received</Badge>;
      case 'refunded':
        return <Badge variant="default" className="capitalize bg-green-600 hover:bg-green-700">Refunded</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="capitalize">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  const getItemsCount = (items: any[]) => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  // Filter local listings
  const filteredData = returnsData?.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return r.status === 'requested';
    return r.status === activeTab;
  }) || [];

  const columns: ColumnDef<Return>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Return / Order',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.getValue('orderNumber')}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Requested',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    { accessorKey: 'customerName', header: 'Customer' },
    {
      accessorKey: 'items',
      header: 'Items Returned',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Package className="h-4 w-4" />
          {getItemsCount(row.getValue('items'))} items
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'refundAmount',
      header: 'Refund Total',
      cell: ({ row }) => formatCurrency(row.getValue('refundAmount')),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {status === 'requested' && (
              <>
                <Button 
                  size="sm" 
                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-sm"
                  onClick={async () => {
                    try {
                      await returnsApi.update(row.original._id, { status: 'approved' });
                      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                      toast.success(`Return for ${row.original.orderNumber} accepted`);
                    } catch {
                      toast.error('Failed to accept return');
                    }
                  }}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-2.5 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 font-medium flex items-center gap-1 shadow-sm"
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to reject return for ${row.original.orderNumber}?`)) {
                      try {
                        await returnsApi.update(row.original._id, { status: 'rejected' });
                        queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                        toast.success(`Return for ${row.original.orderNumber} rejected`);
                      } catch {
                        toast.error('Failed to reject return');
                      }
                    }
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}

            {status === 'approved' && (
              <>
                <Button 
                  size="sm" 
                  className="h-8 px-2.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 shadow-sm"
                  onClick={async () => {
                    try {
                      await returnsApi.update(row.original._id, { status: 'received' });
                      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                      toast.success(`Package marked as received for ${row.original.orderNumber}`);
                    } catch {
                      toast.error('Failed to update status');
                    }
                  }}
                >
                  <Package className="h-3.5 w-3.5" />
                  Received
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-2.5 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium flex items-center gap-1"
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to reject this return for ${row.original.orderNumber}?`)) {
                      try {
                        await returnsApi.update(row.original._id, { status: 'rejected' });
                        queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                        toast.success(`Return for ${row.original.orderNumber} rejected`);
                      } catch {
                        toast.error('Failed to reject return');
                      }
                    }
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}

            {status === 'received' && (
              <>
                <Button 
                  size="sm" 
                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-sm"
                  onClick={async () => {
                    try {
                      await returnsApi.update(row.original._id, { status: 'refunded' });
                      queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                      toast.success(`Refund issued for ${row.original.orderNumber}`);
                    } catch {
                      toast.error('Failed to issue refund');
                    }
                  }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Refund
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-2.5 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium flex items-center gap-1"
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to REJECT the refund for ${row.original.orderNumber}? (No refund will be paid to customer)`)) {
                      try {
                        await returnsApi.update(row.original._id, { status: 'rejected' });
                        queryClient.invalidateQueries({ queryKey: ['returns-list'] });
                        toast.success(`Refund rejected for ${row.original.orderNumber}. No refund was issued.`);
                      } catch {
                        toast.error('Failed to reject refund');
                      }
                    }
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject Refund
                </Button>
              </>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSelectedReturn(row.original);
                setIsDetailsOpen(true);
              }}
              title="View return details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Returns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer return requests, package receiving, and refunds.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tabs filters */}
        <div className="flex border-b pb-px gap-6 text-sm font-medium">
          {[
            { id: 'all', label: 'All Returns' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'received', label: 'Received' },
            { id: 'refunded', label: 'Refunded' },
            { id: 'rejected', label: 'Rejected' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center border rounded-xl bg-card py-24 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <RotateCcw className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No returns found</h2>
            <p className="text-muted-foreground max-w-[400px]">
              {activeTab === 'all'
                ? 'No return requests have been created yet.'
                : `There are currently no return requests with the "${activeTab}" status.`}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            onRowClick={(row) => {
              setSelectedReturn(row);
              setIsDetailsOpen(true);
            }}
          />
        )}
      </div>

      <ReturnDetailsSheet 
        returnObj={selectedReturn}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedReturn(null);
        }}
      />
    </div>
  );
}
