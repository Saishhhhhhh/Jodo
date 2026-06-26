'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  status: string;
  roleIds: Role[];
  lastLoginAt?: string;
  createdAt: string;
}

const columns: ColumnDef<StaffUser>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const roles = row.original.roleIds;
      if (!roles || roles.length === 0) return <span className="text-muted-foreground text-xs">No role</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => (
            <Badge key={role._id} variant="secondary" className="font-normal text-xs">
              {role.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'success' : 'outline'} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    cell: ({ row }) => {
      const lastLogin = row.original.lastLoginAt;
      if (!lastLogin) return <span className="text-muted-foreground text-xs">Never</span>;
      return <span className="text-xs">{format(new Date(lastLogin), 'MMM d, yyyy HH:mm')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.email)}>
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Staff</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Remove Access</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function SettingsStaffPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await staffApi.list();
      return response.data.data as StaffUser[];
    },
  });

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage who has access to your store and what they can do.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <DataTable columns={columns} data={data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
