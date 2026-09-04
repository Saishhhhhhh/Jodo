'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, User, Phone, Mail, Globe, MessageCircle, Instagram, MousePointerClick, Target, ArrowRight, Save, Trash } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Lead = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  source: 'Website' | 'Instagram' | 'WhatsApp' | 'Manual' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  interestLevel: 'High' | 'Medium' | 'Low';
  followUpPriority: 'High' | 'Medium' | 'Low';
  productRequirement?: string;
  budget?: string;
  location?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Edit State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Form State for updates
  const [status, setStatus] = useState<Lead['status']>('New');
  const [priority, setPriority] = useState<Lead['followUpPriority']>('Medium');
  const [interest, setInterest] = useState<Lead['interestLevel']>('Medium');
  const [notes, setNotes] = useState('');

  // Form State for creating
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSource, setNewSource] = useState<Lead['source']>('Manual');

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await leadsApi.list();
      return res.data.data as Lead[];
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsCreateModalOpen(false);
      setNewName('');
      setNewPhone('');
      toast.success('Lead created successfully');
    },
    onError: () => toast.error('Failed to create lead'),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: () => toast.error('Failed to update lead'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsSheetOpen(false);
      toast.success('Lead deleted');
    },
  });

  const handleCreate = () => {
    if (!newName) return toast.error('Name is required');
    createMutation.mutate({
      name: newName,
      phone: newPhone,
      source: newSource,
      status: 'New',
      followUpPriority: 'Medium',
      interestLevel: 'Medium'
    });
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setPriority(lead.followUpPriority);
    setInterest(lead.interestLevel);
    setNotes(lead.notes || '');
    setIsSheetOpen(true);
  };

  const handleSaveUpdate = () => {
    if (!selectedLead) return;
    updateMutation.mutate({
      id: selectedLead._id,
      data: { status, followUpPriority: priority, interestLevel: interest, notes },
    });
  };

  // KPIs
  const kpis = useMemo(() => {
    if (!leads) return { total: 0, new: 0, highPriority: 0, won: 0 };
    return leads.reduce((acc, l) => {
      acc.total++;
      if (l.status === 'New') acc.new++;
      if (l.followUpPriority === 'High' && l.status !== 'Won' && l.status !== 'Lost') acc.highPriority++;
      if (l.status === 'Won') acc.won++;
      return acc;
    }, { total: 0, new: 0, highPriority: 0, won: 0 });
  }, [leads]);

  // Filters
  const filteredData = useMemo(() => {
    if (!leads) return [];
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.phone && l.phone.includes(searchTerm))
    );
  }, [leads, searchTerm]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleRowClick(row.original)}>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm hover:underline">{row.original.name}</span>
              <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                {row.original.phone ? <><Phone className="w-3 h-3"/> {row.original.phone}</> : 'No phone'}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.getValue('status') as string;
          const map: Record<string, string> = {
            'New': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            'Contacted': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
            'Qualified': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
            'Proposal': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
            'Won': 'bg-green-100 text-green-700 hover:bg-green-200',
            'Lost': 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          };
          return <Badge className={`border-none ${map[s] || 'bg-slate-100'}`}>{s}</Badge>;
        }
      },
      {
        accessorKey: 'followUpPriority',
        header: 'Priority',
        cell: ({ row }) => {
          const p = row.original.followUpPriority;
          if (p === 'High') return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">High</Badge>;
          if (p === 'Low') return <span className="text-xs text-muted-foreground ml-2">Low</span>;
          return <span className="text-xs font-medium ml-2">Medium</span>;
        }
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => {
          const s = row.original.source;
          let icon = <MousePointerClick className="w-3 h-3 mr-1" />;
          if (s === 'WhatsApp') icon = <MessageCircle className="w-3 h-3 mr-1" />;
          if (s === 'Instagram') icon = <Instagram className="w-3 h-3 mr-1" />;
          if (s === 'Website') icon = <Globe className="w-3 h-3 mr-1" />;
          
          return (
            <div className="flex items-center text-xs text-muted-foreground">
              {icon} {s}
            </div>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
      }
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Lead Management
          </h1>
          <p className="text-muted-foreground mt-1">Capture, qualify, and convert your incoming leads.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-blue-100 bg-blue-50/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-600 mb-1">New Leads</p>
            <p className="text-2xl font-bold">{kpis.new}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 bg-red-50/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-600 mb-1">High Priority</p>
            <p className="text-2xl font-bold">{kpis.highPriority}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-100 bg-green-50/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-600 mb-1">Won</p>
            <p className="text-2xl font-bold">{kpis.won}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Pipeline</p>
            <p className="text-2xl font-bold">{kpis.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="mb-4 max-w-sm flex items-center gap-2 border px-3 py-2 rounded-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full text-sm outline-none bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DataTable columns={columns} data={filteredData} isLoading={isLoading} />
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={newSource} onValueChange={(val: any) => setNewSource(val)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Details Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedLead?.name}</SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              <Badge variant="outline">{selectedLead?.source}</Badge>
              <span className="text-xs">Added {selectedLead ? new Date(selectedLead.createdAt).toLocaleDateString() : ''}</span>
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="space-y-6">
              
              {/* Contact Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedLead.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.email || 'No email'}</span>
                </div>
              </div>

              {/* Qualification Form */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Qualification</h3>
                
                <div className="space-y-2">
                  <Label>Pipeline Status</Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Won">Won (Converted)</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High"><span className="text-red-600 font-medium">High</span></SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interest Level</Label>
                    <Select value={interest} onValueChange={(val: any) => setInterest(val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">Hot</SelectItem>
                        <SelectItem value="Medium">Warm</SelectItem>
                        <SelectItem value="Low">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea 
                    placeholder="Add details about product requirements, budget, timeline..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex flex-col gap-3">
                <Button onClick={handleSaveUpdate} disabled={updateMutation.isPending} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Save Updates
                </Button>
                <Button variant="destructive" className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none" onClick={() => {
                  if(confirm('Are you sure?')) deleteMutation.mutate(selectedLead._id);
                }}>
                  <Trash className="w-4 h-4 mr-2" /> Delete Lead
                </Button>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
