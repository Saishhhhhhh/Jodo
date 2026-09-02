'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MessageSquare, Trash, Check, AlertTriangle, Star, Search, Package, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ReviewSheet } from './review-sheet';
import { toast } from 'sonner';

type Review = {
  _id: string;
  productId: {
    _id: string;
    title: string;
    sku: string;
    imageUrl?: string;
    category?: string;
    vendor?: string;
  } | null;
  rating: number;
  authorName: string;
  authorEmail: string;
  title?: string;
  body: string;
  status: 'approved' | 'pending' | 'spam';
  createdAt: string;
};

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Edit review state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await reviewsApi.list();
      return res.data.data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reviewsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setIsDetailOpen(false);
      setIsSheetOpen(false);
      toast.success('Review updated successfully');
    },
    onError: () => toast.error('Failed to update review'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setIsDetailOpen(false);
      setIsSheetOpen(false);
      toast.success('Review deleted successfully');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'approved' } });
  };

  const handleMarkSpam = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'spam' } });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRowClick = (review: Review) => {
    setSelectedReview(review);
    setIsDetailOpen(true);
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setIsSheetOpen(true);
  };

  const handleSaveReview = (formData: any) => {
    if (editingReview) {
      updateMutation.mutate({ id: editingReview._id, data: formData });
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { totalReviews: 0, avgRating: 0, pendingCount: 0 };
    let totalScore = 0;
    let pendingCount = 0;
    
    data.forEach((r: Review) => {
      totalScore += r.rating;
      if (r.status === 'pending') {
        pendingCount += 1;
      }
    });

    return {
      totalReviews: data.length,
      avgRating: (totalScore / data.length).toFixed(1),
      pendingCount,
    };
  }, [data]);

  // Search Filter
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (r: Review) =>
        (r.productId?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Star Renderer Helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => {
          const r = row.original;
          const prod = r.productId;
          return prod ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{prod.title}</span>
                <span className="text-[11px] text-muted-foreground font-mono truncate">{prod.sku}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Deleted Product</span>
          );
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number;
          return renderStars(rating);
        },
      },
      {
        accessorKey: 'authorName',
        header: 'Reviewer',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm">{r.authorName}</span>
              <span className="text-[11px] text-muted-foreground">{r.authorEmail}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'body',
        header: 'Comment',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div 
              className="flex flex-col max-w-[280px] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleRowClick(r)}
            >
              {r.title && <span className="font-semibold text-xs truncate">{r.title}</span>}
              <span className="text-xs text-muted-foreground truncate">{r.body}</span>
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

          if (status === 'approved') {
            badgeVariant = 'default';
            customClass = 'bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none';
          } else if (status === 'pending') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none';
          } else if (status === 'spam') {
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
        id: 'actions',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRowClick(r)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Read Full Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditClick(r)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Review
                </DropdownMenuItem>
                {r.status !== 'approved' && (
                  <DropdownMenuItem onClick={() => handleApprove(r._id)}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Approve Review
                  </DropdownMenuItem>
                )}
                {r.status !== 'spam' && (
                  <DropdownMenuItem onClick={() => handleMarkSpam(r._id)}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                    Mark as Spam
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleDelete(r._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Review
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Moderate and read customer reviews for your products</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-bold mt-1 font-mono">{metrics.totalReviews}</p>
          </div>
        </div>

        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Rating</p>
            <p className="text-2xl font-bold mt-1 font-mono">{metrics.avgRating} / 5.0</p>
          </div>
        </div>

        <div className="p-5 border rounded-lg bg-card shadow-sm flex items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-3 text-green-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Moderation</p>
            <p className="text-2xl font-bold mt-1 font-mono">{metrics.pendingCount} pending</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-2 max-w-md bg-card rounded-md border px-3 py-1.5 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by Product, Reviewer, Title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <DataTable columns={columns} data={filteredData} isLoading={isLoading} />

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Moderate this customer comment for product {selectedReview?.productId?.title || 'product'}.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-4 text-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold">{selectedReview.authorName}</span>
                  <span className="text-xs text-muted-foreground">({selectedReview.authorEmail})</span>
                </div>
                {renderStars(selectedReview.rating)}
              </div>

              <div className="space-y-2">
                {selectedReview.title && (
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {selectedReview.title}
                  </h3>
                )}
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReview.body}
                </p>
              </div>

              <div className="flex items-center gap-2 border-t pt-3">
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge 
                  variant="secondary" 
                  className={
                    selectedReview.status === 'approved' 
                      ? 'bg-green-500/10 text-green-600 border-none' 
                      : selectedReview.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 border-none'
                      : 'bg-destructive/10 text-destructive border-none'
                  }
                >
                  {selectedReview.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap items-center justify-end gap-2 sm:space-x-0">
            {selectedReview && (
              <Button onClick={() => { setIsDetailOpen(false); handleEditClick(selectedReview); }} variant="outline">
                <Pencil className="mr-2 h-4 w-4" /> Edit Review
              </Button>
            )}
            {selectedReview?.status !== 'approved' && (
              <Button onClick={() => handleApprove(selectedReview!._id)} className="bg-green-600 hover:bg-green-700">
                Approve Review
              </Button>
            )}
            {selectedReview?.status !== 'spam' && (
              <Button onClick={() => handleMarkSpam(selectedReview!._id)} variant="secondary">
                Mark as Spam
              </Button>
            )}
            <Button onClick={() => handleDelete(selectedReview!._id)} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReviewSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        review={editingReview}
        onSave={handleSaveReview}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
