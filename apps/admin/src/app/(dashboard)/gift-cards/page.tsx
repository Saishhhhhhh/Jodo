'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { giftCardsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash, CreditCard, Copy, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GiftCardSheet } from './gift-card-sheet';
import { toast } from 'sonner';

type GiftCard = {
  _id: string;
  code: string;
  initialValue: number;
  balance: number;
  expiryDate?: string;
  recipientEmail?: string;
  note?: string;
  status: 'active' | 'disabled' | 'expired';
  createdAt: string;
};

export default function GiftcardsPage() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});

  // Fetch gift cards
  const { data, isLoading } = useQuery({
    queryKey: ['gift-cards'],
    queryFn: async () => {
      const res = await giftCardsApi.list();
      return res.data.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newCard: any) => giftCardsApi.create(newCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      setIsSheetOpen(false);
      toast.success('Gift card issued successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to issue gift card';
      toast.error(msg);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => giftCardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      setIsSheetOpen(false);
      toast.success('Gift card updated successfully');
    },
    onError: () => toast.error('Failed to update gift card'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => giftCardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      toast.success('Gift card revoked successfully');
    },
    onError: () => toast.error('Failed to revoke gift card'),
  });

  const handleCreate = () => {
    setEditingCard(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (card: GiftCard) => {
    setEditingCard(card);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke this gift card? Once revoked, it cannot be used.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (formData: any) => {
    if (editingCard) {
      updateMutation.mutate({ id: editingCard._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Gift card code copied to clipboard');
  };

  // Metrics
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { totalIssued: 0, activeBalance: 0, activeCount: 0 };
    return data.reduce(
      (acc: any, curr: GiftCard) => {
        acc.totalIssued += curr.initialValue;
        if (curr.status === 'active') {
          acc.activeBalance += curr.balance;
          acc.activeCount += 1;
        }
        return acc;
      },
      { totalIssued: 0, activeBalance: 0, activeCount: 0 }
    );
  }, [data]);

  // Filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (card: GiftCard) =>
        card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.recipientEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val);
  };

  const columns = useMemo<ColumnDef<GiftCard>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Card Code',
        cell: ({ row }) => {
          const card = row.original;
          const isRevealed = !!revealedCodes[card._id];
          const displayCode = isRevealed
            ? card.code
            : `•••• •••• ${card.code.slice(-4)}`;

          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-wider font-semibold">{displayCode}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => toggleReveal(card._id)}
              >
                {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(card.code)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: 'recipientEmail',
        header: 'Recipient',
        cell: ({ row }) => {
          const email = row.getValue('recipientEmail') as string;
          return email ? (
            <span className="text-sm font-medium">{email}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">None (Direct Link)</span>
          );
        },
      },
      {
        accessorKey: 'balance',
        header: 'Balance / Initial',
        cell: ({ row }) => {
          const card = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{formatCurrency(card.balance)}</span>
              <span className="text-[11px] text-muted-foreground">
                of {formatCurrency(card.initialValue)}
              </span>
            </div>
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
          } else if (status === 'disabled') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none';
          } else if (status === 'expired') {
            badgeVariant = 'outline';
            customClass = 'bg-destructive/10 text-destructive border-none';
          }

          return (
            <Badge variant={badgeVariant} className={`text-xs capitalize font-medium ${customClass}`}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'expiryDate',
        header: 'Expires On',
        cell: ({ row }) => {
          const expiry = row.getValue('expiryDate') as string;
          return expiry ? (
            <span className="text-xs text-muted-foreground">
              {new Date(expiry).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Never Expires</span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const card = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(card)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit / Adjust
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(card._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Revoke Card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [revealedCodes]
  );

  return (
    <div className="p-6 animate-fade-in space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Issue and manage digital gift cards for customers</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Issue Gift Card
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Value Issued</p>
            <p className="text-2xl font-bold mt-1 font-mono">{formatCurrency(metrics.totalIssued)}</p>
          </div>
        </div>

        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-3 text-green-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Balance</p>
            <p className="text-2xl font-bold mt-1 font-mono">{formatCurrency(metrics.activeBalance)}</p>
          </div>
        </div>

        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Cards Count</p>
            <p className="text-2xl font-bold mt-1 font-mono">{metrics.activeCount} active</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-2 max-w-md bg-card rounded-md border px-3 py-1.5 shadow-sm">
        <Copy className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by code or recipient email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <DataTable columns={columns} data={filteredData} isLoading={isLoading} />

      <GiftCardSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        giftCard={editingCard}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
