'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { navigationApi } from '@/lib/api-client';

export default function NavigationPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHandle, setNewHandle] = useState('');

  const { data: menus, isLoading } = useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      const res = await navigationApi.list();
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string, handle: string }) => navigationApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewHandle('');
      toast.success('Menu created successfully');
      router.push(`/navigation/${res.data.data._id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create menu');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => navigationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      toast.success('Menu deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete menu');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newHandle.trim()) {
      return toast.error('Title and Handle are required');
    }
    createMutation.mutate({ title: newTitle, handle: newHandle });
  };

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: 'title', 
      header: 'Menu Title',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold block">{row.getValue('title')}</span>
          <span className="text-xs text-muted-foreground">handle: {row.original.handle}</span>
        </div>
      )
    },
    {
      accessorKey: 'items',
      header: 'Items Count',
      cell: ({ row }) => <span>{row.original.items?.length || 0} links</span>
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => <span>{new Date(row.original.updatedAt).toLocaleDateString()}</span>
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/navigation/${row.original._id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Manage Links
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(row.original._id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Menu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navigation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your store's menus and navigation links</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Menu</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Menu Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Footer Menu" 
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!newHandle || newHandle.includes('-')) {
                        setNewHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="handle">Handle (used in code)</Label>
                  <Input 
                    id="handle" 
                    placeholder="e.g. footer-menu" 
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <DataTable 
        columns={columns} 
        data={menus || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}
