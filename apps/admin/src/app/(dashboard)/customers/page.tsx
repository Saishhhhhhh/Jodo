'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2,
  KeyRound
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CustomerFormSheet } from './customer-form-sheet';
import { ResetPasswordDialog } from './reset-password-dialog';

type Customer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  status: string;
  createdAt: string;
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToResetPassword, setCustomerToResetPassword] = useState<Customer | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.list();
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete customer');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer profile? This action is permanent.')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || <span className="text-zinc-500">—</span>,
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
    {
      accessorKey: 'ordersCount',
      header: 'Orders',
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalSpent'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return formatted;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;
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
                    setSelectedCustomer(customer);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setCustomerToResetPassword(customer);
                    setIsResetPasswordOpen(true);
                  }}
                  className="text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
                >
                  <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDelete(customer._id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer base</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCustomer(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading} 
        onRowClick={(row) => {
          setSelectedCustomer(row);
          setIsFormOpen(true);
        }}
      />

      <CustomerFormSheet 
        customer={selectedCustomer}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        onResetPasswordClick={(cust) => {
          setCustomerToResetPassword(cust);
          setIsResetPasswordOpen(true);
        }}
      />

      <ResetPasswordDialog
        customer={customerToResetPassword}
        open={isResetPasswordOpen}
        onOpenChange={(open) => {
          setIsResetPasswordOpen(open);
          if (!open) setCustomerToResetPassword(null);
        }}
      />
    </div>
  );
}
