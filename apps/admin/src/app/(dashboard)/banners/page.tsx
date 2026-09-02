'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { bannersApi, getImageUrl } from '@/lib/api-client';
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

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    image: '',
    tagline: '',
    heading: '',
    subtext: '',
    buttonText: 'Discover Now',
    buttonUrl: '/shop',
    status: 'active',
  });

  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await bannersApi.list();
      return res.data.data;
    },
  });

  const banners = bannersData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => bannersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create banner');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bannersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update banner');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete banner');
    },
  });

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        image: banner.image,
        tagline: banner.tagline,
        heading: banner.heading,
        subtext: banner.subtext,
        buttonText: banner.buttonText,
        buttonUrl: banner.buttonUrl,
        status: banner.status,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        image: '',
        tagline: '',
        heading: '',
        subtext: '',
        buttonText: 'Discover Now',
        buttonUrl: '/shop',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: 'image', 
      header: 'Preview',
      cell: ({ row }) => (
        <div className="w-16 h-10 relative rounded overflow-hidden">
          <img src={getImageUrl(row.getValue('image'))} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )
    },
    { 
      accessorKey: 'heading', 
      header: 'Heading',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('heading')}</span>
    },
    {
      accessorKey: 'tagline',
      header: 'Tagline',
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
            <DropdownMenuItem onClick={() => handleOpenModal(row.original)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(row.original._id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage homepage and promotional banners</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Banner
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={banners} 
        isLoading={isLoading} 
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image (URL or Upload)</Label>
              <div className="flex gap-2">
                <Input 
                  required 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.image?.startsWith('data:') ? 'Uploaded File (Base64)' : formData.image} 
                  onChange={e => {
                    if (!formData.image?.startsWith('data:')) {
                      setFormData({ ...formData, image: e.target.value })
                    }
                  }}
                  readOnly={formData.image?.startsWith('data:')}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (formData.image?.startsWith('data:')) {
                      setFormData({ ...formData, image: '' });
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {formData.image?.startsWith('data:') ? <X className="h-4 w-4 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                  {formData.image?.startsWith('data:') ? 'Clear' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input 
                required 
                placeholder="Crafting Comfort, Shaping Style" 
                value={formData.tagline} 
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input 
                required 
                placeholder="Elevating Everyday Living..." 
                value={formData.heading} 
                onChange={e => setFormData({ ...formData, heading: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtext</Label>
              <Input 
                required 
                placeholder="From modern minimalist to timeless..." 
                value={formData.subtext} 
                onChange={e => setFormData({ ...formData, subtext: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input 
                  required 
                  placeholder="Discover Now" 
                  value={formData.buttonText} 
                  onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Button URL</Label>
                <Input 
                  required 
                  placeholder="/shop" 
                  value={formData.buttonUrl} 
                  onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingBanner ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
