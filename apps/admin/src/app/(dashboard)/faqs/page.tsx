'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FiPlus,
  FiMoreHorizontal,
  FiEdit,
  FiTrash2,
  FiHelpCircle,
  FiExternalLink,
  FiSearch,
  FiCheckCircle,
  FiEyeOff,
  FiFolder,
  FiLayers,
  FiArrowUpRight,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { faqsApi } from '@/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_CATEGORIES = [
  'New to Tool-Free Furniture?',
  'Assembly & Ease of Use',
  'Moving & Renting',
  'Quality & Durability',
  'Materials & Origin',
  'Care & Maintenance',
  'Delivery & Logistics',
  'Pricing & Value',
  'Returns & Warranty',
];

export default function FaqsAdminPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Custom category input toggle
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Orders & Delivery',
    order: 0,
    status: 'active',
  });

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await faqsApi.list();
      return res.data.data;
    },
  });

  const faqs: any[] = faqsData || [];

  // Dynamically extract all existing categories from backend faqs
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  // Filtered FAQs for table view
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        searchQuery === '' ||
        faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || faq.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [faqs, searchQuery, selectedCategory, selectedStatus]);

  // Metrics
  const stats = useMemo(() => {
    const total = faqs.length;
    const active = faqs.filter((f) => f.status === 'active').length;
    const inactive = total - active;
    const categoriesCount = new Set(faqs.map((f) => f.category)).size;
    return { total, active, inactive, categoriesCount };
  }, [faqs]);

  const createMutation = useMutation({
    mutationFn: (data: any) => faqsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ created successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create FAQ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => faqsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ updated successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update FAQ');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => faqsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update FAQ status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete FAQ');
    },
  });

  const handleOpenModal = (faq: any = null) => {
    if (faq) {
      setEditingFaq(faq);
      const isKnownCategory = allCategories.includes(faq.category);
      setIsCustomCategory(!isKnownCategory);
      setCustomCategoryText(isKnownCategory ? '' : faq.category);

      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || 'Orders & Delivery',
        order: faq.order ?? 0,
        status: faq.status || 'active',
      });
    } else {
      setEditingFaq(null);
      setIsCustomCategory(false);
      setCustomCategoryText('');
      setFormData({
        question: '',
        answer: '',
        category: 'Orders & Delivery',
        order: faqs.length + 1,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setIsCustomCategory(false);
    setCustomCategoryText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      return toast.error('Question and Answer are required');
    }

    const finalCategory = isCustomCategory
      ? customCategoryText.trim() || 'General'
      : formData.category;

    const payload = {
      ...formData,
      category: finalCategory,
    };

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'order',
      header: 'Order',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold font-mono">
          {String(row.getValue('order') ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'question',
      header: 'Question & Answer',
      cell: ({ row }) => (
        <div className="max-w-[460px]">
          <span className="font-semibold text-sm text-foreground block line-clamp-1">
            {row.getValue('question')}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {row.original.answer}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-medium bg-muted/30">
          {row.getValue('category')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = String(row.getValue('status') ?? 'active');
        const isActive = status === 'active';
        return (
          <button
            type="button"
            onClick={() => toggleStatusMutation.mutate(row.original._id)}
            title="Click to toggle status"
            className="group cursor-pointer text-left"
          >
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={`capitalize text-xs transition-transform group-hover:scale-105 ${
                isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FiMoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenModal(item)}>
                <FiEdit className="mr-2 h-4 w-4" /> Edit FAQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatusMutation.mutate(item._id)}>
                {item.status === 'active' ? (
                  <>
                    <FiEyeOff className="mr-2 h-4 w-4 text-amber-500" /> Mark Inactive
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Mark Active
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`${storefrontUrl}/faqs`, '_blank')}
              >
                <FiExternalLink className="mr-2 h-4 w-4" /> View on Storefront
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this FAQ?')) {
                    deleteMutation.mutate(item._id);
                  }
                }}
              >
                <FiTrash2 className="mr-2 h-4 w-4" /> Delete FAQ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FiHelpCircle className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage questions, categories, and answers displayed live on the storefront help center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`${storefrontUrl}/faqs`, '_blank')}
            className="gap-2"
          >
            <span>View on Storefront</span>
            <FiExternalLink className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      </div>

      {/* ── METRIC STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total FAQs
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FiHelpCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active on Site
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.active}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Inactive / Draft
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.inactive}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FiEyeOff className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Categories
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.categoriesCount}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FiFolder className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="bg-card p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search FAQs by question, answer, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Status:</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={columns}
        data={filteredFaqs}
        isLoading={isLoading}
      />

      {/* ── CREATE / EDIT DIALOG ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                required
                placeholder="e.g. How does JODO tool-free click assembly work?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryText('');
                      }
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {isCustomCategory ? 'Choose from list' : '+ New Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <Input
                    placeholder="Enter custom category name..."
                    value={customCategoryText}
                    onChange={(e) => setCustomCategoryText(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                required
                rows={5}
                placeholder="Detailed, helpful answer text for customers. Explain clearly in friendly language..."
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              />
            </div>

            {/* LIVE PREVIEW ACCORDION CARD */}
            {formData.question.trim() && (
              <div className="p-4 rounded-xl bg-muted/40 border space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span>Storefront Preview</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {isCustomCategory ? customCategoryText || 'General' : formData.category}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formData.question}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formData.answer || 'Answer will preview here...'}
                </p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingFaq ? 'Save Changes' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
