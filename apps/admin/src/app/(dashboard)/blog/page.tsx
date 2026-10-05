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
  FiExternalLink,
  FiBookOpen,
  FiSearch,
  FiCheckCircle,
  FiFileText,
  FiStar,
  FiRefreshCw,
  FiImage,
  FiTag,
  FiEye,
  FiCode,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { toast } from 'sonner';
import { blogsApi } from '@/lib/api-client';
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

const DEFAULT_BLOG_CATEGORIES = [
  'Craft & Material',
  'Design & Interiors',
  'Care & Longevity',
  'Living Well',
  'News & Announcements',
];

const CURATED_IMAGE_PRESETS = [
  {
    name: 'Teak Craft',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Living Space',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Wood Grain',
    url: 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Modern Lounge',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Natural Fabric',
    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Custom Category
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  // Markdown live preview tab
  const [contentTab, setContentTab] = useState<'editor' | 'preview'>('editor');

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Craft & Material',
    author: 'Jodo Editorial',
    authorRole: 'Design & Craft Studio',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    featured: false,
    status: 'published',
    excerpt: '',
    content: '',
    tags: [] as string[],
  });

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await blogsApi.list();
      return res.data.data;
    },
  });

  const blogs: any[] = blogsData || [];

  // Extract all categories dynamically
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_BLOG_CATEGORIES);
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        searchQuery === '' ||
        blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || blog.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || blog.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategory, selectedStatus]);

  // Metrics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'published').length;
    const drafts = total - published;
    const featured = blogs.filter((b) => b.featured).length;
    return { total, published, drafts, featured };
  }, [blogs]);

  const createMutation = useMutation({
    mutationFn: (data: any) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog post created successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create blog post');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog post updated successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update blog post');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => blogsApi.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Featured status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle featured');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => blogsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Post status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete blog post');
    },
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleOpenModal = (blog: any = null) => {
    if (blog) {
      setEditingBlog(blog);
      const isKnown = allCategories.includes(blog.category);
      setIsCustomCategory(!isKnown);
      setCustomCategoryText(isKnown ? '' : blog.category);

      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        category: blog.category || 'Craft & Material',
        author: blog.author || 'Jodo Editorial',
        authorRole: blog.authorRole || 'Design & Craft Studio',
        coverImage: blog.coverImage || '',
        readTime: blog.readTime || '5 min read',
        featured: Boolean(blog.featured),
        status: blog.status || 'published',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        tags: Array.isArray(blog.tags) ? blog.tags : [],
      });
    } else {
      setEditingBlog(null);
      setIsCustomCategory(false);
      setCustomCategoryText('');
      setFormData({
        title: '',
        slug: '',
        category: 'Craft & Material',
        author: 'Jodo Editorial',
        authorRole: 'Design & Craft Studio',
        coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        readTime: '5 min read',
        featured: false,
        status: 'published',
        excerpt: '',
        content: '',
        tags: ['Solid Wood', 'Slow Living'],
      });
    }
    setContentTab('editor');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setIsCustomCategory(false);
    setCustomCategoryText('');
    setTagInput('');
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData({ ...formData, content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      return toast.error('Title, Excerpt and Content are required');
    }

    const finalCategory = isCustomCategory
      ? customCategoryText.trim() || 'General'
      : formData.category;

    const finalSlug = (formData.slug || generateSlug(formData.title)).trim();

    const payload = {
      ...formData,
      slug: finalSlug,
      category: finalCategory,
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Story / Article',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 max-w-[400px]">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-14 h-10 rounded-md object-cover border shrink-0 bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80';
                }}
              />
            ) : (
              <div className="w-14 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 border">
                <FiImage className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground block line-clamp-1">
                  {item.title}
                </span>
                {item.featured && (
                  <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-500/10 border-amber-500/30 px-1 py-0 h-4 shrink-0">
                    <HiSparkles className="w-2.5 h-2.5 mr-0.5 text-amber-500" /> Featured
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground block line-clamp-1">
                /blog/{item.slug}
              </span>
            </div>
          </div>
        );
      },
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
      accessorKey: 'author',
      header: 'Author & Read Time',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium text-foreground block">
            {String(row.getValue('author') ?? 'Jodo Editorial')}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            {row.original.readTime || '5 min read'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = String(row.getValue('status') ?? 'draft');
        const isPublished = status === 'published';
        return (
          <button
            type="button"
            onClick={() => toggleStatusMutation.mutate(row.original._id)}
            title="Click to toggle published / draft"
            className="group cursor-pointer text-left"
          >
            <Badge
              variant={isPublished ? 'default' : 'secondary'}
              className={`capitalize text-xs transition-transform group-hover:scale-105 ${
                isPublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          </button>
        );
      },
    },
    {
      accessorKey: 'featured',
      header: 'Hero Pin',
      cell: ({ row }) => {
        const isFeatured = Boolean(row.original.featured);
        return (
          <button
            type="button"
            onClick={() => toggleFeaturedMutation.mutate(row.original._id)}
            title={isFeatured ? 'Pinned on Hero. Click to unpin' : 'Click to pin on Hero'}
            className="p-1 rounded-md hover:bg-muted transition-colors text-center"
          >
            <FiStar
              className={`w-4 h-4 ${
                isFeatured ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/50'
              }`}
            />
          </button>
        );
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const d = row.getValue('publishedAt') as string;
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </span>
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
                <FiEdit className="mr-2 h-4 w-4" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFeaturedMutation.mutate(item._id)}>
                <FiStar className="mr-2 h-4 w-4 text-amber-500" />
                {item.featured ? 'Unpin from Hero' : 'Pin to Hero (Featured)'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatusMutation.mutate(item._id)}>
                <FiCheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                {item.status === 'published' ? 'Switch to Draft' : 'Publish Story'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`${storefrontUrl}/blog/${item.slug}`, '_blank')}
              >
                <FiExternalLink className="mr-2 h-4 w-4" /> View on Storefront
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                    deleteMutation.mutate(item._id);
                  }
                }}
              >
                <FiTrash2 className="mr-2 h-4 w-4" /> Delete Post
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
            <FiBookOpen className="h-6 w-6 text-primary" />
            The Jodo Journal • Editorial &amp; Stories
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage stories, woodcraft essays, and living inspiration published live on your storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`${storefrontUrl}/blog`, '_blank')}
            className="gap-2"
          >
            <span>View Journal</span>
            <FiExternalLink className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <FiPlus className="mr-2 h-4 w-4" />
            Create Story
          </Button>
        </div>
      </div>

      {/* ── METRIC STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Stories
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FiBookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Published
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.published}</p>
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
                Drafts
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.drafts}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FiFileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Hero Featured
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.featured}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <HiSparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="bg-card p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stories by title, author, category..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={columns}
        data={filteredBlogs}
        isLoading={isLoading}
      />

      {/* ── CREATE / EDIT DIALOG ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog Story' : 'Create New Journal Story'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Story Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. The Art of Slow Furniture: Why Intentional Craftsmanship Matters"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: editingBlog ? formData.slug : generateSlug(title),
                  });
                }}
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FiRefreshCw className="w-3 h-3" /> Auto-generate
                  </button>
                </div>
                <Input
                  id="slug"
                  required
                  placeholder="art-of-slow-furniture"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) setCustomCategoryText('');
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {isCustomCategory ? 'Choose from list' : '+ New Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <Input
                    placeholder="Enter custom category..."
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
            </div>

            {/* Author, Role & Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  placeholder="Aarav Mehta"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="authorRole">Author Role / Title</Label>
                <Input
                  id="authorRole"
                  placeholder="Head of Furniture Design"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  placeholder="e.g. 5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                />
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-xl border">
              <div className="space-y-1.5">
                <Label htmlFor="status">Publication Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published (Visible on site)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2.5 pt-6">
                <input
                  id="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="featured" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <HiSparkles className="w-4 h-4 text-amber-500" />
                  Pin as Hero Featured Story on Journal
                </Label>
              </div>
            </div>

            {/* Cover Image URL + Presets & Live Thumbnail */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <span className="text-[11px] text-muted-foreground">
                  Presets:
                  {CURATED_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className="ml-1.5 text-primary hover:underline text-[11px]"
                    >
                      {preset.name}
                    </button>
                  ))}
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Input
                  id="coverImage"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="flex-1"
                />
                {formData.coverImage && (
                  <div className="w-16 h-10 rounded-md overflow-hidden border shrink-0 bg-muted">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Short Excerpt / Card Summary</Label>
              <Textarea
                id="excerpt"
                required
                rows={2}
                placeholder="2–3 sentences summarizing the story for article cards..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">Topic Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a tag and press Enter or click Add (e.g. Solid Wood)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  Add Tag
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 gap-1.5 cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                      title="Click to remove"
                    >
                      <span>#{tag}</span>
                      <span className="text-[10px]">✕</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content with Markdown Toolbar & Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="content">Full Article Content</Label>
                  <span className="text-[11px] text-muted-foreground">(Markdown supported)</span>
                </div>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setContentTab('editor')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      contentTab === 'editor'
                        ? 'bg-background text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FiCode className="inline w-3 h-3 mr-1" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab('preview')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      contentTab === 'preview'
                        ? 'bg-background text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FiEye className="inline w-3 h-3 mr-1" />
                    Live Preview
                  </button>
                </div>
              </div>

              {contentTab === 'editor' ? (
                <div className="space-y-1.5">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border text-xs">
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('## ')}
                      className="px-2 py-1 rounded hover:bg-background font-bold text-xs"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('### ')}
                      className="px-2 py-1 rounded hover:bg-background font-bold text-xs"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('**', '**')}
                      className="px-2 py-1 rounded hover:bg-background font-bold text-xs"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('> ')}
                      className="px-2 py-1 rounded hover:bg-background italic text-xs"
                      title="Blockquote"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('- ')}
                      className="px-2 py-1 rounded hover:bg-background text-xs"
                      title="Bullet list"
                    >
                      • List
                    </button>
                  </div>

                  <Textarea
                    id="content"
                    required
                    rows={10}
                    placeholder="Write your article body here. Use ## for section headings, ### for subheadings, > for callout quotes, and - for bullet lists..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>
              ) : (
                <div className="min-h-[220px] max-h-[340px] overflow-y-auto p-4 rounded-xl bg-muted/20 border space-y-4 text-sm">
                  {formData.content ? (
                    formData.content.split('\n\n').filter(Boolean).map((block, idx) => {
                      if (block.startsWith('### ')) {
                        return <h3 key={idx} className="font-bold text-base text-foreground pt-2">{block.replace('### ', '')}</h3>;
                      }
                      if (block.startsWith('## ')) {
                        return <h2 key={idx} className="font-bold text-lg text-foreground pt-3 border-b pb-1">{block.replace('## ', '')}</h2>;
                      }
                      if (block.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-primary pl-3 italic text-muted-foreground bg-primary/5 py-1.5 my-2 rounded-r">
                            {block.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (block.startsWith('- ') || block.startsWith('* ')) {
                        const items = block.split('\n');
                        return (
                          <ul key={idx} className="list-disc pl-5 space-y-1">
                            {items.map((it, i) => (
                              <li key={i}>{it.replace(/^[-*]\s*/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={idx} className="leading-relaxed text-muted-foreground">{block}</p>;
                    })
                  ) : (
                    <p className="text-muted-foreground text-xs italic">Article preview will appear here once you write content.</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingBlog ? 'Save Changes' : 'Publish Story'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
