'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Mail,
  Send,
  CalendarClock,
  Pencil,
  Copy,
  Trash2,
  TrendingUp,
  MousePointerClick,
  Eye,
  IndianRupee,
  LayoutTemplate,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Initial Mock Data
const initialCampaigns = [
  { id: 1, name: 'Summer Sale Announcement', status: 'Sent', sentDate: 'Jun 15, 2026', openRate: 45.2, clickRate: 6.8, sales: 125000 },
  { id: 2, name: 'Welcome Series - Email 1', status: 'Sent', sentDate: 'Ongoing', openRate: 52.1, clickRate: 12.4, sales: 45000 },
  { id: 3, name: 'VIP Early Access - Fall Collection', status: 'Scheduled', sentDate: 'Jul 1, 2026', openRate: null, clickRate: null, sales: 0 },
  { id: 4, name: 'Abandoned Cart Reminder', status: 'Draft', sentDate: null, openRate: null, clickRate: null, sales: 0 },
  { id: 5, name: 'June Monthly Newsletter', status: 'Sent', sentDate: 'Jun 1, 2026', openRate: 38.4, clickRate: 3.2, sales: 15000 },
];

const templates = [
  { id: 1, name: 'Product Launch', description: 'Announce a new product or collection with a bold hero image.', icon: LayoutTemplate, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 2, name: 'Sale Announcement', description: 'Drive urgency with a limited-time offer and clear discount code.', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 3, name: 'Monthly Newsletter', description: 'Share updates, blog posts, and curated products with your subscribers.', icon: Mail, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

export default function MarketingEmailPage() {
  const [campaigns, setCampaigns] = React.useState(initialCampaigns);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('All');
  
  const [editingCampaign, setEditingCampaign] = React.useState<{id: number, name: string} | null>(null);
  const [newName, setNewName] = React.useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newCampaignForm, setNewCampaignForm] = React.useState({ name: '', subject: '' });

  const handleRename = () => {
    if (!editingCampaign || !newName.trim()) return;
    setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, name: newName.trim() } : c));
    setEditingCampaign(null);
  };

  const filteredCampaigns = React.useMemo(() => {
    let result = campaigns;
    if (activeTab !== 'All') {
      result = result.filter(c => c.status === activeTab);
    }
    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [campaigns, searchQuery, activeTab]);

  const handleCreateSubmit = () => {
    if (!newCampaignForm.name.trim()) return;
    const newId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1;
    const newCampaign = {
      id: newId,
      name: newCampaignForm.name.trim(),
      status: 'Draft',
      sentDate: null,
      openRate: null,
      clickRate: null,
      sales: 0
    };
    setCampaigns([newCampaign, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaignForm({ name: '', subject: '' });
  };

  const createCampaign = (name: string = 'New Email Campaign') => {
    const newId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1;
    const newCampaign = {
      id: newId,
      name,
      status: 'Draft',
      sentDate: null,
      openRate: null,
      clickRate: null,
      sales: 0
    };
    setCampaigns([newCampaign, ...campaigns]);
  };

  const duplicateCampaign = (campaign: any) => {
    createCampaign(`${campaign.name} (Copy)`);
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const updateStatus = (id: number, newStatus: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          status: newStatus,
          sentDate: newStatus === 'Sent' ? 'Just now' : newStatus === 'Scheduled' ? 'Tomorrow' : null
        };
      }
      return c;
    }));
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Marketing</h2>
          <p className="text-muted-foreground mt-1">Design, send, and track beautiful email campaigns.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create campaign
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,240</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.4%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.8%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Generated</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹185,000</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-8">
          
          <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList>
                <TabsTrigger value="All">All Campaigns</TabsTrigger>
                <TabsTrigger value="Draft">Draft</TabsTrigger>
                <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="Sent">Sent</TabsTrigger>
              </TabsList>
              
              <div className="relative w-64 hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search campaigns..." 
                  className="pl-8 bg-muted/50 border-none h-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </Tabs>

          {/* Campaigns Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No campaigns found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="group">
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium">{campaign.name}</span>
                          {campaign.sentDate && (
                            <p className="text-xs text-muted-foreground">
                              {campaign.status === 'Sent' ? 'Sent on ' : 'Scheduled for '}
                              {campaign.sentDate}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={
                            campaign.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 
                            campaign.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {campaign.status === 'Sent' && <Send className="h-3 w-3 mr-1" />}
                          {campaign.status === 'Scheduled' && <CalendarClock className="h-3 w-3 mr-1" />}
                          {campaign.status === 'Draft' && <Pencil className="h-3 w-3 mr-1" />}
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {campaign.openRate ? `${campaign.openRate}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {campaign.clickRate ? `${campaign.clickRate}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {campaign.sales > 0 ? formatCurrency(campaign.sales) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingCampaign({ id: campaign.id, name: campaign.name }); setNewName(campaign.name); }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename campaign
                            </DropdownMenuItem>
                            {campaign.status === 'Draft' && (
                              <DropdownMenuItem onClick={() => updateStatus(campaign.id, 'Scheduled')}>
                                <CalendarClock className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                            )}
                            {(campaign.status === 'Draft' || campaign.status === 'Scheduled') && (
                              <DropdownMenuItem onClick={() => updateStatus(campaign.id, 'Sent')}>
                                <Send className="h-4 w-4 mr-2" />
                                Send now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => duplicateCampaign(campaign)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-500" onClick={() => deleteCampaign(campaign.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Quick Templates</h3>
            <p className="text-sm text-muted-foreground">Start a new campaign from a pre-built template.</p>
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 bg-muted/10 hover:bg-muted/30"
                  onClick={() => createCampaign(`${template.name} Campaign`)}
                >
                  <CardHeader className="pb-3">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center mb-2 ${template.bg}`}>
                      <template.icon className={`h-5 w-5 ${template.color}`} />
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename campaign</DialogTitle>
            <DialogDescription>Enter a new name for your email campaign.</DialogDescription>
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
            <Button variant="outline" onClick={() => setEditingCampaign(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new campaign</DialogTitle>
            <DialogDescription>Setup your new email marketing campaign.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g. Summer Sale 2026"
                value={newCampaignForm.name}
                onChange={(e) => setNewCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Email Subject Line (Optional)</Label>
              <Input
                id="campaign-subject"
                placeholder="e.g. 50% Off Summer Essentials!"
                value={newCampaignForm.subject}
                onChange={(e) => setNewCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubmit}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
