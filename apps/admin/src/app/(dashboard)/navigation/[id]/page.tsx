'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, GripVertical, Trash2, Edit2, Save } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { navigationApi } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NavItem = {
  id: string;
  label: string;
  url: string;
};

export default function NavigationBuilderPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [items, setItems] = useState<NavItem[]>([]);
  const [menuTitle, setMenuTitle] = useState('');
  const [menuHandle, setMenuHandle] = useState('');
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['navigation', params.id],
    queryFn: async () => {
      const res = await navigationApi.get(params.id);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (menuData) {
      setMenuTitle(menuData.title);
      setMenuHandle(menuData.handle);
      setItems(menuData.items || []);
    }
  }, [menuData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => navigationApi.update(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation', params.id] });
      toast.success('Menu saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save menu');
    }
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
  };

  const handleSaveMenu = () => {
    updateMutation.mutate({
      title: menuTitle,
      handle: menuHandle,
      items: items
    });
  };

  const openItemModal = (item?: NavItem) => {
    if (item) {
      setEditingItemId(item.id);
      setItemLabel(item.label);
      setItemUrl(item.url);
    } else {
      setEditingItemId(null);
      setItemLabel('');
      setItemUrl('');
    }
    setIsItemModalOpen(true);
  };

  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemLabel.trim() || !itemUrl.trim()) {
      return toast.error('Label and URL are required');
    }
    
    let newItems = [...items];
    if (editingItemId) {
      newItems = newItems.map(i => i.id === editingItemId ? { ...i, label: itemLabel, url: itemUrl } : i);
    } else {
      newItems.push({
        id: crypto.randomUUID(),
        label: itemLabel,
        url: itemUrl
      });
    }
    
    setItems(newItems);
    setIsItemModalOpen(false);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/navigation')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Navigation Menu</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage links and their order</p>
          </div>
        </div>
        <Button onClick={handleSaveMenu} disabled={updateMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Menu'}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Menu Settings */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Menu Settings</h3>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={menuTitle} onChange={(e) => setMenuTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Handle</Label>
              <Input value={menuHandle} onChange={(e) => setMenuHandle(e.target.value)} disabled />
              <p className="text-xs text-muted-foreground">The handle is used to fetch this menu in the storefront codebase.</p>
            </div>
          </div>
        </div>

        {/* Menu Items Builder */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Menu Items</h3>
            <Button variant="outline" size="sm" onClick={() => openItemModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
              No links in this menu yet. Click 'Add Link' to get started.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 border rounded-lg bg-card transition-colors ${snapshot.isDragging ? 'border-terracotta shadow-md' : 'hover:border-border/80'}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab">
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-medium text-sm truncate">{item.label}</span>
                                <span className="text-xs text-muted-foreground truncate">{item.url}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openItemModal(item)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <form onSubmit={saveItem}>
            <DialogHeader>
              <DialogTitle>{editingItemId ? 'Edit Link' : 'Add Link'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Link Label</Label>
                <Input 
                  id="label" 
                  placeholder="e.g. Living Room" 
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  placeholder="e.g. /shop?category=living-room" 
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>Cancel</Button>
              <Button type="submit">
                {editingItemId ? 'Update Link' : 'Add Link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
