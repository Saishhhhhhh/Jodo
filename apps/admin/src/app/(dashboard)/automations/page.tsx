'use client';

import React from 'react';
import {
  Plus,
  Workflow,
  Search,
  Play,
  Pause,
  MoreHorizontal,
  Zap,
  Mail,
  AlertTriangle,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Globe
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
import { Pencil } from 'lucide-react';

// Initial Mock Data
const initialWorkflows = [
  { id: 1, name: 'Abandoned Cart Recovery (WhatsApp)', trigger: 'Checkout created', status: 'Active', runs: 1240, lastRun: '2 mins ago', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', type: 'whatsapp' },
  { id: 2, name: 'Welcome New Subscribers', trigger: 'Customer created', status: 'Active', runs: 856, lastRun: '15 mins ago', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10', type: 'website' },
  { id: 3, name: 'High-Risk Fraud Alert', trigger: 'Order created', status: 'Active', runs: 12, lastRun: '1 day ago', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', type: 'website' },
  { id: 4, name: 'Low Inventory Slack Alert', trigger: 'Inventory quantity changed', status: 'Draft', runs: 0, lastRun: 'Never', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', type: 'website' },
  { id: 5, name: 'Auto-tag Wholesale Orders', trigger: 'Order created', status: 'Paused', runs: 430, lastRun: '3 weeks ago', icon: Workflow, color: 'text-amber-500', bg: 'bg-amber-500/10', type: 'website' },
  { id: 6, name: 'COD Order Confirmation', trigger: 'Order created', status: 'Active', runs: 3200, lastRun: '10 mins ago', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', type: 'whatsapp' },
  { id: 7, name: 'Shipping Status Updates', trigger: 'Fulfillment updated', status: 'Active', runs: 4100, lastRun: '1 min ago', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', type: 'whatsapp' },
];

const templates = [
  { id: 1, name: 'Win back lapsed customers', description: 'Send a discount code to customers who haven\'t purchased in 90 days.', icon: Mail, type: 'website' },
  { id: 2, name: 'Cancel high-risk orders', description: 'Automatically cancel and refund orders flagged as high risk by Shopify.', icon: AlertTriangle, type: 'website' },
  { id: 3, name: 'Reward VIP customers', description: 'Tag customers as VIP when their lifetime spend exceeds ₹50,000.', icon: Zap, type: 'website' },
  { id: 4, name: 'WhatsApp Cart Recovery', description: 'Send a WhatsApp message with a checkout link after 1 hour of abandonment.', icon: MessageCircle, type: 'whatsapp' },
  { id: 5, name: 'WhatsApp Post-Purchase Upsell', description: 'Send a WhatsApp message offering a discount on related items right after purchase.', icon: MessageCircle, type: 'whatsapp' },
];

const recentActivity = [
  { id: 1, workflow: 'Abandoned Cart Recovery', status: 'Success', time: '2 mins ago' },
  { id: 2, workflow: 'Welcome New Subscribers', status: 'Success', time: '15 mins ago' },
  { id: 3, workflow: 'High-Risk Fraud Alert', status: 'Failed', time: '1 day ago' },
  { id: 4, workflow: 'Abandoned Cart Recovery', status: 'Success', time: '1 day ago' },
];

export default function AutomationsPage() {
  const [workflows, setWorkflows] = React.useState(initialWorkflows);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');

  const [editingWorkflow, setEditingWorkflow] = React.useState<{id: number, name: string} | null>(null);
  const [newName, setNewName] = React.useState('');

  const handleRename = () => {
    if (!editingWorkflow || !newName.trim()) return;
    setWorkflows(prev => prev.map(w => w.id === editingWorkflow.id ? { ...w, name: newName.trim() } : w));
    setEditingWorkflow(null);
  };

  const filteredWorkflows = React.useMemo(() => {
    let result = workflows;
    if (activeTab !== 'all') {
      result = result.filter(w => w.type === activeTab);
    }
    if (searchQuery) {
      result = result.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.trigger.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [workflows, searchQuery, activeTab]);

  const filteredTemplates = React.useMemo(() => {
    if (activeTab === 'all') return templates;
    return templates.filter(t => t.type === activeTab);
  }, [activeTab]);

  const toggleStatus = (id: number) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'Active' ? 'Paused' : w.status === 'Paused' ? 'Active' : w.status };
      }
      return w;
    }));
  };

  const deleteWorkflow = (id: number) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const createWorkflow = (name: string = 'New Custom Workflow', icon: any = Workflow, color: string = 'text-primary', bg: string = 'bg-primary/10', type: string = activeTab === 'whatsapp' ? 'whatsapp' : 'website') => {
    const newId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;
    const newWorkflow = {
      id: newId,
      name,
      trigger: 'Draft trigger',
      status: 'Draft',
      runs: 0,
      lastRun: 'Never',
      icon,
      color,
      bg,
      type
    };
    setWorkflows([newWorkflow, ...workflows]);
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground mt-1">Automate your store tasks and workflows.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => createWorkflow()}>
            <Plus className="mr-2 h-4 w-4" />
            Create workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-8">

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="all">All Automations</TabsTrigger>
              <TabsTrigger value="whatsapp">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="website">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Active Workflows Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Your Workflows</CardTitle>
                <CardDescription>Manage active automations and view performance.</CardDescription>
              </div>
              <div className="relative w-64 hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search workflows..."
                  className="pl-8 bg-muted/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total Runs</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Last Run</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No workflows found matching "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : filteredWorkflows.map((workflow) => (
                    <TableRow key={workflow.id} className="group">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${workflow.bg}`}>
                            <workflow.icon className={`h-4 w-4 ${workflow.color}`} />
                          </div>
                          <span className="font-medium">{workflow.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            workflow.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' :
                              workflow.status === 'Paused' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' :
                                'bg-muted text-muted-foreground'
                          }
                        >
                          {workflow.status === 'Active' && <Play className="h-3 w-3 mr-1 fill-current" />}
                          {workflow.status === 'Paused' && <Pause className="h-3 w-3 mr-1 fill-current" />}
                          {workflow.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {workflow.trigger}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {workflow.runs.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                        {workflow.lastRun}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingWorkflow({ id: workflow.id, name: workflow.name }); setNewName(workflow.name); }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename workflow
                            </DropdownMenuItem>
                            <DropdownMenuItem>View runs</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {workflow.status === 'Active' ? (
                              <DropdownMenuItem onClick={() => toggleStatus(workflow.id)}>Pause</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => toggleStatus(workflow.id)}>Turn on</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-rose-500" onClick={() => deleteWorkflow(workflow.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Templates Gallery */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Discover Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 bg-muted/10 hover:bg-muted/30"
                  onClick={() => createWorkflow(template.name, template.icon, 'text-primary', 'bg-primary/10', template.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                      <template.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base flex items-center justify-between">
                      {template.name}
                      {template.type === 'whatsapp' ? (
                        <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Globe className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </CardTitle>
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

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {activity.status === 'Success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 mt-0.5">
                    <p className="text-sm font-medium leading-tight">{activity.workflow}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" size="sm" className="w-full">View all runs</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!editingWorkflow} onOpenChange={(open) => !open && setEditingWorkflow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename workflow</DialogTitle>
            <DialogDescription>Enter a new name for your automation workflow.</DialogDescription>
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
            <Button variant="outline" onClick={() => setEditingWorkflow(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
