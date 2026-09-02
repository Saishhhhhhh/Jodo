'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerSegmentsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CreateSegmentDialog } from './create-segment-dialog';
import { SegmentDetailsSheet } from './segment-details-sheet';

type Segment = {
  _id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
};

export default function CustomerSegmentsPage() {
  const queryClient = useQueryClient();
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: segmentsData, isLoading } = useQuery({
    queryKey: ['segments-list'],
    queryFn: async () => {
      const res = await customerSegmentsApi.list();
      return res.data.data as Segment[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerSegmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments-list'] });
      toast.success('Customer segment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete customer segment');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer segment? This will not affect actual customer profiles.')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Segment>[] = [
    {
      accessorKey: 'name',
      header: 'Segment',
      cell: ({ row }) => (
        <span className="font-semibold text-primary cursor-pointer hover:underline">
          {row.getValue('name')}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || <span className="text-zinc-500">No description</span>,
    },
    {
      accessorKey: 'memberCount',
      header: 'Members',
      cell: ({ row }) => (
        <span className="font-semibold text-indigo-400">
          {row.getValue('memberCount')} customers
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const seg = row.original;
        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedSegment(seg);
                    setIsDetailsOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Cohort Members
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDelete(seg._id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Segment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Segments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Group your customers using structured rules to target marketing campaigns.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Segment
        </Button>
      </div>

      {segmentsData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-xl bg-card py-24 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No segments created</h2>
          <p className="text-muted-foreground max-w-[400px]">
            Segments let you filter and save customer cohorts by total spend, orders count, and account statuses.
          </p>
          <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsCreateOpen(true)}>
            Create First Segment
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={segmentsData || []}
          isLoading={isLoading}
          onRowClick={(row) => {
            setSelectedSegment(row);
            setIsDetailsOpen(true);
          }}
        />
      )}

      <CreateSegmentDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <SegmentDetailsSheet 
        segment={selectedSegment}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedSegment(null);
        }}
      />

    </div>
  );
}
