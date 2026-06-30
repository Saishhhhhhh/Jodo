'use client';

import React from 'react';
import {
  ExternalLink,
  MoreHorizontal,
  Paintbrush,
  Lock,
  Gauge,
  Eye,
  Settings,
  MoreVertical,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Initial Mock Data
const initialCurrentTheme = {
  name: 'Dawn',
  version: '13.0.1',
  status: 'Live',
  lastSaved: 'Today at 9:41 AM',
  thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'
};

const initialThemeLibrary = [
  { id: 1, name: 'Sense', version: '11.0.0', lastSaved: 'Saved 2 days ago', active: false },
  { id: 2, name: 'Craft', version: '10.2.1', lastSaved: 'Saved last week', active: false },
  { id: 3, name: 'Dawn Backup', version: '12.0.0', lastSaved: 'Saved a month ago', active: false },
];

export default function ChannelsOnlinePage() {
  const [activeTheme, setActiveTheme] = React.useState(initialCurrentTheme);
  const [library, setLibrary] = React.useState(initialThemeLibrary);
  const [editingTheme, setEditingTheme] = React.useState<{id: number | 'active', name: string} | null>(null);
  const [newName, setNewName] = React.useState('');

  const openRenameDialog = (id: number | 'active', currentName: string) => {
    setEditingTheme({ id, name: currentName });
    setNewName(currentName);
  };

  const handleRename = () => {
    if (!editingTheme || !newName.trim()) return;
    
    if (editingTheme.id === 'active') {
      setActiveTheme(prev => ({ ...prev, name: newName.trim() }));
    } else {
      setLibrary(prev => prev.map(t => t.id === editingTheme.id ? { ...t, name: newName.trim() } : t));
    }
    setEditingTheme(null);
  };

  const addTheme = () => {
    setLibrary(prev => [{ id: Date.now(), name: 'New Custom Theme', version: '1.0.0', lastSaved: 'Just now', active: false }, ...prev]);
  };

  const publishTheme = (id: number) => {
    const themeToPublish = library.find(t => t.id === id);
    if (!themeToPublish) return;
    
    const oldActiveTheme = {
       id: Date.now(),
       name: activeTheme.name,
       version: activeTheme.version,
       lastSaved: 'Just now',
       active: false
    };

    setActiveTheme({
      name: themeToPublish.name,
      version: themeToPublish.version,
      status: 'Live',
      lastSaved: 'Just now',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop' // keeping placeholder thumbnail
    });

    setLibrary(prev => [oldActiveTheme, ...prev.filter(t => t.id !== id)]);
  };

  const duplicateTheme = (theme: any) => {
    setLibrary(prev => [{ ...theme, id: Date.now(), name: `${theme.name} (Copy)` }, ...prev]);
  };

  const removeTheme = (id: number) => {
    setLibrary(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Themes</h2>
          <p className="text-muted-foreground mt-1">Manage your store's appearance and layout.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Store
          </Button>
          <Button>
            <Paintbrush className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Theme */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Current Theme</h3>
            <Card className="overflow-hidden border-2 border-primary/20">
              <div
                className="h-[300px] w-full bg-muted bg-cover bg-center border-b"
                style={{ backgroundImage: `url(${activeTheme.thumbnail})` }}
              >
                <div className="w-full h-full bg-black/10 flex items-center justify-center backdrop-blur-[2px] transition-all hover:backdrop-blur-none" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-bold">{activeTheme.name}</h4>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                        {activeTheme.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Version {activeTheme.version} • {activeTheme.lastSaved}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>Preview</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openRenameDialog('active', activeTheme.name)}>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Download theme file</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit code</DropdownMenuItem>
                        <DropdownMenuItem>Edit default theme content</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button>Customize</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Theme Library */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">Theme Library</h3>
              <Button variant="outline" size="sm" onClick={() => addTheme()}>Add theme</Button>
            </div>
            <div className="grid gap-4">
              {library.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                  No themes in library. Click "Add theme" to create one.
                </div>
              )}
              {library.map((theme) => (
                <Card key={theme.id}>
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shrink-0 border">
                        <Laptop className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{theme.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Version {theme.version} • {theme.lastSaved}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>Preview</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRenameDialog(theme.id, theme.name)}>Rename</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateTheme(theme)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-500" onClick={() => removeTheme(theme.id)}>Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline">Customize</Button>
                      <Button variant="secondary" onClick={() => publishTheme(theme.id)}>Publish</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Store Password</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your store is currently password protected. Only visitors with the password can access it.
              </p>
              <div className="bg-muted p-3 rounded-md mb-4 flex items-center justify-between border">
                <code className="text-sm font-mono">coming-soon-2026</code>
                <Button variant="ghost" size="sm" className="h-8">Copy</Button>
              </div>
              <Button variant="outline" className="w-full">Manage Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Store Speed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      className="text-muted stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500 stroke-current"
                      strokeDasharray="82, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">82</span>
                  </div>
                </div>
                <p className="text-sm font-medium mt-4">Good Speed</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Your store is faster than 75% of similar stores.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full text-primary">View detailed report</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!editingTheme} onOpenChange={(open) => !open && setEditingTheme(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename theme</DialogTitle>
            <DialogDescription>Enter a new name for this theme.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTheme(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
