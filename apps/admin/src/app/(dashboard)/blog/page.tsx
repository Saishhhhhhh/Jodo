'use client';

import { useState } from 'react';
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

export default function BlogPage() {
  const [data] = useState([]);

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: 'title', 
      header: 'Post Title',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('title')}</span>
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published At',
    },
    {
      id: 'actions',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit Post</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Post</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your store's blog content</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        isLoading={false} 
      />
    </div>
  );
}
