'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash2, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { blogsApi } from '@/lib/api-client';
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

const BLOG_CATEGORIES = [
  'Craft & Material',
  'Design & Interiors',
  'Care & Longevity',
  'Living Well',
  'News & Announcements',
];

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Craft & Material',
    author: 'Jodo Editorial',
    authorRole: 'Design & Craft Studio',
    coverImage: '',
    readTime: '5 min read',
    featured: false,
    status: 'published',
    excerpt: '',
    content: '',
  });

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await blogsApi.list();
      return res.data.data;
    },
  });

  const blogs = blogsData || [];

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

  const handleOpenModal = (blog: any = null) => {
    if (blog) {
      setEditingBlog(blog);
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
      });
    } else {
      setEditingBlog(null);
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
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      return toast.error('Title, Excerpt and Content are required');
    }

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-[340px]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground block line-clamp-1">
              {row.getValue('title')}
            </span>
            {row.original.featured && (
              <Badge variant="outline" className="text-[10px] text-terracotta border-terracotta/40 px-1 py-0 h-4">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Featured
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground block line-clamp-1">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-medium">
          {row.getValue('category')}
        </Badge>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => <span className="text-xs">{String(row.getValue('author') ?? '')}</span>,
    },
    {
      accessorKey: 'readTime',
      header: 'Read Time',
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{String(row.getValue('readTime') ?? '')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = String(row.getValue('status') ?? 'draft');
        return (
          <Badge variant={status === 'published' ? 'default' : 'secondary'} className="capitalize text-xs">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published Date',
      cell: ({ row }) => {
        const d = row.getValue('publishedAt') as string;
        return (
          <span className="text-xs text-muted-foreground">
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenModal(item)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`http://localhost:3000/blog/${item.slug}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> View on Storefront
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this blog post?')) {
                    deleteMutation.mutate(item._id);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your store&apos;s editorial stories and journal articles.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        isLoading={isLoading}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. The Art of Slow Furniture"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                  setFormData({
                    ...formData,
                    title,
                    slug: editingBlog ? formData.slug : autoSlug,
                  });
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  required
                  placeholder="art-of-slow-furniture"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Author name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                required
                placeholder="https://images.unsplash.com/..."
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Short Excerpt / Summary</Label>
              <Textarea
                id="excerpt"
                required
                rows={2}
                placeholder="Brief summary displayed on cards..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Article Content</Label>
              <Textarea
                id="content"
                required
                rows={8}
                placeholder="Full article body. Supports markdown paragraphs and ## section titles..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                Feature this story on top of the Journal
              </Label>
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
