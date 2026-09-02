'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash, FolderOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CollectionSheet } from './collection-sheet';
import { toast } from 'sonner';

type Collection = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  type: 'manual' | 'automated';
  products: any[];
  status: 'active' | 'draft' | 'archived';
};

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Fetch collections
  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await collectionsApi.list();
      return res.data.data;
    },
  });

  // Create Collection
  const createMutation = useMutation({
    mutationFn: (newCollection: any) => collectionsApi.create(newCollection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsSheetOpen(false);
      toast.success('Collection created successfully');
    },
    onError: () => toast.error('Failed to create collection'),
  });

  // Update Collection
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => collectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsSheetOpen(false);
      toast.success('Collection updated successfully');
    },
    onError: () => toast.error('Failed to update collection'),
  });

  // Delete Collection
  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: () => toast.error('Failed to delete collection'),
  });

  const handleCreate = () => {
    setEditingCollection(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (col: Collection) => {
    setEditingCollection(col);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (formData: any) => {
    if (editingCollection) {
      updateMutation.mutate({ id: editingCollection._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Collection',
        cell: ({ row }) => {
          const col = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {col.imageUrl ? (
                  <img src={col.imageUrl} alt={col.title} className="h-full w-full object-cover" />
                ) : (
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{col.title}</span>
                <span className="text-[11px] text-muted-foreground truncate font-mono">
                  /{col.slug}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('type') as string;
          return (
            <Badge variant="outline" className="capitalize text-xs font-medium">
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'products',
        header: 'Products Count',
        cell: ({ row }) => {
          const products = row.original.products || [];
          return (
            <span className="text-xs font-medium text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          let badgeVariant: 'default' | 'secondary' | 'outline' = 'secondary';
          let customClass = '';

          if (status === 'active') {
            badgeVariant = 'default';
            customClass = 'bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none';
          } else if (status === 'draft') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none';
          } else if (status === 'archived') {
            badgeVariant = 'outline';
            customClass = 'text-muted-foreground border-muted';
          }

          return (
            <Badge variant={badgeVariant} className={`text-xs capitalize font-medium ${customClass}`}>
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const col = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(col)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(col._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Group products into collections for catalog navigation</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Collection
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />

      <CollectionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        collection={editingCollection}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
