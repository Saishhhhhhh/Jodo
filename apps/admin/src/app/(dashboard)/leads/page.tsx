'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Plus, User, Phone, Mail, Globe, MessageCircle, Instagram, MousePointerClick, Target, Save, Trash, Download, LayoutList, KanbanSquare } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Papa from 'papaparse';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
type Lead = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  source: 'Website' | 'Instagram' | 'WhatsApp' | 'Manual' | 'Other';
  status: LeadStatus;
  interestLevel: 'High' | 'Medium' | 'Low';
  followUpPriority: 'High' | 'Medium' | 'Low';
  productRequirement?: string;
  budget?: string;
  location?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
};

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  
  // Need to wait for mounted to render DND context (hydration mismatch fix)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  
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
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newProductReq, setNewProductReq] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newSource, setNewSource] = useState<Lead['source']>('Manual');
  const [newInterest, setNewInterest] = useState<Lead['interestLevel']>('Medium');
  const [newPriority, setNewPriority] = useState<Lead['followUpPriority']>('Medium');
  const [newNotes, setNewNotes] = useState('');

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
      setNewEmail('');
      setNewLocation('');
      setNewProductReq('');
      setNewBudget('');
      setNewSource('Manual');
      setNewInterest('Medium');
      setNewPriority('Medium');
      setNewNotes('');
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
      email: newEmail,
      location: newLocation,
      productRequirement: newProductReq,
      budget: newBudget,
      source: newSource,
      status: 'New',
      followUpPriority: newPriority,
      interestLevel: newInterest,
      notes: newNotes,
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
    setIsSheetOpen(false);
  };

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return toast.error('No leads to export');
    
    const csvData = leads.map(l => ({
      Name: l.name,
      Phone: l.phone || '',
      Email: l.email || '',
      Status: l.status,
      Priority: l.followUpPriority,
      Interest: l.interestLevel,
      Source: l.source,
      Notes: l.notes || '',
      Created: new Date(l.createdAt).toLocaleDateString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kanban Drag and Drop Handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as LeadStatus;
      
      // Optimistically update local cache
      queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(lead => lead._id === draggableId ? { ...lead, status: newStatus } : lead);
      });

      // Fire backend update
      updateMutation.mutate({ id: draggableId, data: { status: newStatus } });
    }
  };

  // Filters and Data
  const filteredData = useMemo(() => {
    if (!leads) return [];
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.phone && l.phone.includes(searchTerm))
    );
  }, [leads, searchTerm]);

  const kanbanBoard = useMemo(() => {
    const board: Record<LeadStatus, Lead[]> = {
      New: [], Contacted: [], Qualified: [], Proposal: [], Won: [], Lost: []
    };
    filteredData.forEach(lead => {
      if (board[lead.status]) {
        board[lead.status].push(lead);
      }
    });
    return board;
  }, [filteredData]);

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

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      'New': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'Contacted': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      'Qualified': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      'Proposal': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      'Won': 'bg-green-500/10 text-green-600 dark:text-green-400',
      'Lost': 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    };
    return <Badge className={`border-none ${map[s] || 'bg-secondary'}`}>{s}</Badge>;
  };

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
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'followUpPriority',
        header: 'Priority',
        cell: ({ row }) => {
          const p = row.original.followUpPriority;
          if (p === 'High') return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">High</Badge>;
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
          return <div className="flex items-center text-xs text-muted-foreground">{icon} {s}</div>;
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.phone && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10" asChild>
                <a href={`https://wa.me/${row.original.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </Button>
            )}
            {row.original.email && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10" asChild>
                <a href={`mailto:${row.original.email}`}>
                  <Mail className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Lead Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Capture, qualify, and convert your incoming leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-500 dark:text-blue-400">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 bg-muted/60 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-mono">{kpis.new}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 bg-muted/60 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-mono text-destructive">{kpis.highPriority}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Won</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 bg-muted/60 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{kpis.won}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 bg-muted/60 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-mono">{kpis.total}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workspace Area */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-card shadow-sm w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full text-sm outline-none bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
            <TabsTrigger value="kanban"><KanbanSquare className="w-4 h-4 mr-2"/> Board</TabsTrigger>
            <TabsTrigger value="list"><LayoutList className="w-4 h-4 mr-2"/> List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="m-0 bg-card rounded-xl border shadow-sm p-4">
          <DataTable columns={columns} data={filteredData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="kanban" className="m-0">
          {isMounted && (
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] min-h-[460px]">
              <DragDropContext onDragEnd={onDragEnd}>
                {COLUMNS.map((columnId) => (
                  <div key={columnId} className="flex flex-col w-[300px] shrink-0 bg-muted/40 rounded-xl border p-3">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {columnId} 
                        <Badge variant="secondary" className="px-1.5 py-0 min-w-[20px] text-center justify-center text-[10px]">
                          {kanbanBoard[columnId]?.length || 0}
                        </Badge>
                      </h3>
                    </div>
                    
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto space-y-3 rounded-md transition-colors min-h-[120px] ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                        >
                          {isLoading ? (
                            <div className="space-y-3 p-1">
                              <div className="h-20 bg-muted/60 animate-pulse rounded-lg" />
                              <div className="h-20 bg-muted/60 animate-pulse rounded-lg" />
                            </div>
                          ) : kanbanBoard[columnId]?.length === 0 ? (
                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted/50 rounded-lg text-xs text-muted-foreground/50 select-none">
                              No leads in {columnId}
                            </div>
                          ) : (
                            kanbanBoard[columnId]?.map((lead, index) => (
                              <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style as React.CSSProperties}
                                    onClick={() => handleRowClick(lead)}
                                    className={`bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${snapshot.isDragging ? 'shadow-md rotate-2 scale-105' : ''}`}
                                  >
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="font-semibold text-sm leading-tight">{lead.name}</h4>
                                      {lead.followUpPriority === 'High' && (
                                        <div className="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1" />
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                      {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {lead.phone}</span>}
                                      {lead.email && <span className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 shrink-0"/> {lead.email}</span>}
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                        {lead.source}
                                      </span>
                                      {lead.interestLevel === 'High' && <Badge variant="secondary" className="text-[10px] py-0 h-4 bg-orange-500/10 text-orange-500">HOT</Badge>}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </DragDropContext>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals & Sheets below */}
      <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <SheetHeader className="px-6 py-6 border-b">
            <SheetTitle className="text-xl">Add New Lead</SheetTitle>
            <SheetDescription>Enter the details for the new lead below.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
                <div className="space-y-2">
                  <Label>Name <span className="text-destructive">*</span></Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1234567890" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Location / City</Label>
                  <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="e.g. Mumbai" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lead Details</h3>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label>Interest Level</Label>
                    <Select value={newInterest} onValueChange={(val: any) => setNewInterest(val)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">Hot</SelectItem>
                        <SelectItem value="Medium">Warm</SelectItem>
                        <SelectItem value="Low">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input value={newBudget} onChange={e => setNewBudget(e.target.value)} placeholder="e.g. $500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High"><span className="text-destructive font-medium">High</span></SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Requirement</Label>
                  <Input value={newProductReq} onChange={e => setNewProductReq(e.target.value)} placeholder="What are they looking for?" />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Initial Notes</Label>
              <Textarea 
                value={newNotes} 
                onChange={e => setNewNotes(e.target.value)} 
                placeholder="Add any context, background information, or specific requests here..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2 mt-auto">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Lead</Button>
          </div>
        </SheetContent>
      </Sheet>

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
                        <SelectItem value="High"><span className="text-destructive font-medium">High</span></SelectItem>
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

              <div className="pt-4 border-t flex flex-col gap-3">
                <Button onClick={handleSaveUpdate} disabled={updateMutation.isPending} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Save Updates
                </Button>
                <Button variant="destructive" className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-none" onClick={() => {
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
