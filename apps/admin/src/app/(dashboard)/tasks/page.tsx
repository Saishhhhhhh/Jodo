'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Clock, 
  Calendar as CalendarIcon, 
  RotateCcw, 
  Lock, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Building,
  ClipboardList,
  Trash2,
  Users,
  CheckCircle
} from 'lucide-react';
import { useTasksStore, Task, TaskPriority, TaskStatus } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { staffApi, tasksApi } from '@/lib/api-client';
import { TaskCard } from '@/components/tasks/task-card';
import { EditTaskModal } from '@/components/tasks/edit-task-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function TasksPage() {
  const router = useRouter();
  const { tasks, fetchTasks, addTask, deleteTask } = useTasksStore();
  const currentUser = useAuthStore((state) => state.user);

  // Active tab: 'list' or 'new'
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');

  // Role simulation: allow testing as Admin/Manager vs Team Member
  const defaultIsAdmin = currentUser?.roles?.some(r => 
    ['admin', 'owner', 'manager', 'ADMIN', 'OWNER', 'MANAGER', 'superadmin', 'SUPER_ADMIN'].includes(r)
  ) ?? true;
  const [simulatedRole, setSimulatedRole] = useState<'admin' | 'team_member'>(
    defaultIsAdmin ? 'admin' : 'team_member'
  );

  const isAdminOrManager = simulatedRole === 'admin';

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [assignedView, setAssignedView] = useState<'all' | 'my'>('all');

  // Staff members list for assignment
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Edit task modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Refresh spinner
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Form State for "NEW TASK"
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientBrief, setClientBrief] = useState('');
  const [category, setCategory] = useState<string>('Sales');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDeliverable, setProjectDeliverable] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial tasks & staff
  useEffect(() => {
    fetchTasks();
    loadStaff();
  }, [fetchTasks]);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await staffApi.list({ limit: 100 });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to load staff', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTasks();
      toast.success('Tasks refreshed');
    } catch {
      toast.error('Failed to refresh tasks');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAllTasks = async () => {
    if (!isAdminOrManager) {
      toast.error('Only administrators can clear tasks.');
      return;
    }

    if (tasks.length === 0) {
      toast.info('No tasks to clear');
      return;
    }

    const confirmClear = window.confirm(`Are you sure you want to delete all ${tasks.length} tasks? This cannot be undone.`);
    if (!confirmClear) return;

    setIsClearingAll(true);
    try {
      // Delete each task
      for (const t of tasks) {
        const id = (t._id || t.id);
        if (id) {
          await tasksApi.delete(id).catch(() => null);
        }
      }
      await fetchTasks();
      toast.success('All tasks have been removed successfully.');
    } catch (err) {
      console.error('Failed to clear tasks:', err);
      toast.error('Failed to clear all tasks');
    } finally {
      setIsClearingAll(false);
    }
  };

  // Word count calculator
  const countWords = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Auto-fill client if known project selected
  const handleProjectChange = (val: string) => {
    setProjectName(val);
    if (val.toLowerCase().includes('jodo')) {
      if (!clientName) setClientName('Arbor Decor');
    } else if (val.toLowerCase().includes('purebot') || val.toLowerCase().includes('pure bot')) {
      if (!clientName) setClientName('Pure Bot Solutions LLP');
    }
  };

  // Submit New Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrManager) {
      toast.error('Team members cannot create tasks. Only administrators and project managers can create tasks.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      let resolvedAssignedTo = assignedTo;
      if (!resolvedAssignedTo || resolvedAssignedTo === 'unassigned') {
        resolvedAssignedTo = currentUser?.id || 'unassigned';
      }

      await addTask({
        title: title.trim(),
        description: description.trim(),
        clientBrief: clientBrief.trim() || undefined,
        priority: isUrgent ? 'Critical' : priority,
        status,
        department: category,
        category: category,
        team: category,
        assignedTo: resolvedAssignedTo,
        dueDate: dueDate || undefined,
        clientName: clientName.trim() || undefined,
        projectName: projectName.trim() || undefined,
        projectDeliverable: projectDeliverable.trim() || undefined,
        driveUrl: driveUrl.trim() || undefined,
        estimatedHours: estimatedHours.trim() || undefined,
        isUrgent,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setClientBrief('');
      setCategory('Sales');
      setPriority('Medium');
      setStatus('Pending');
      setEstimatedHours('');
      setAssignedTo('');
      setClientName('');
      setProjectName('');
      setProjectDeliverable('');
      setDriveUrl('');
      setDueDate('');
      setIsUrgent(false);

      setActiveTab('list');
      toast.success('Task created successfully');
    } catch (err: any) {
      console.error('Failed to create task', err);
      toast.error(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks: Sales, Operations, Content, Support and Follow-ups
  const departmentList = ['ALL', 'SALES', 'OPERATIONS', 'CONTENT', 'SUPPORT', 'FOLLOW-UPS'];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Department / Category filter
      if (selectedDepartment !== 'ALL') {
        const teamName = (t.category || t.department || t.team || '').toUpperCase();
        if (selectedDepartment === 'FOLLOW-UPS') {
          if (!teamName.includes('FOLLOW')) {
            return false;
          }
        } else {
          if (!teamName.includes(selectedDepartment)) {
            return false;
          }
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL') {
        if (t.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesClient = t.clientName?.toLowerCase().includes(q);
        const matchesProject = t.projectName?.toLowerCase().includes(q);
        const matchesAssignee = typeof t.assignedTo === 'string' 
          ? t.assignedTo.toLowerCase().includes(q) 
          : t.assignedTo?.name?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesClient && !matchesProject && !matchesAssignee) {
          return false;
        }
      }

      // 4. Assigned View: 'my' vs 'all'
      if (assignedView === 'my') {
        const currentUserId = currentUser?.id;
        const assignedId = typeof t.assignedTo === 'string' ? t.assignedTo : t.assignedTo?._id || t.assignedTo?.id;
        if (assignedId !== currentUserId) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedDepartment, selectedStatus, search, assignedView, currentUser]);

  // Overall KPI statistics
  const totalTasksCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed' || t.status === 'Closed').length;
  const totalDurationSecs = tasks.reduce((acc, t) => acc + (t.loggedDuration || 0), 0);
  const totalHours = Math.floor(totalDurationSecs / 3600);
  const totalMinutes = Math.floor((totalDurationSecs % 3600) / 60);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* ============================================================ */}
      {/* Header: Title, Live Badge, Subtitle & Action Controls         */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
              Live Operations
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Coordinate team deliverables, work durations, client milestones, and departmental workloads from one unified workspace.
          </p>
        </div>

        {/* Right side controls: Role switch, Refresh, Clear All, Create Task */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Role simulation switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/80 text-xs">
            <button
              type="button"
              onClick={() => setSimulatedRole('admin')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isAdminOrManager 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin / Manager
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRole('team_member')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !isAdminOrManager 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Team Member
            </button>
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh tasks"
          >
            <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Clear All Tasks (Admin Only) */}
          {isAdminOrManager && tasks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearAllTasks}
              disabled={isClearingAll}
              title="Remove all existing tasks"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isClearingAll ? 'Clearing...' : 'Clear All'}</span>
            </Button>
          )}

          {/* Create Task Button */}
          {isAdminOrManager ? (
            <Button
              size="sm"
              className="h-9 text-xs gap-1.5 font-semibold"
              onClick={() => setActiveTab(activeTab === 'new' ? 'list' : 'new')}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{activeTab === 'new' ? 'View Task List' : 'Create Task'}</span>
            </Button>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border text-muted-foreground text-xs"
              title="Team members can update timer duration and status but cannot create new tasks."
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Creation: Admin only</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Summary KPI Cards (Matching Jodo Dashboard Aesthetic)         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Tasks
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">
              {totalTasksCount}
            </span>
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Across all active projects
          </span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            In Progress
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {inProgressCount}
            </span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Active working runs
          </span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider block">
            Completed Tasks
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
              {completedCount}
            </span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Verified deliverables
          </span>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Logged Work Time
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {totalHours}h {totalMinutes}m
            </span>
            <Briefcase className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Cumulative stopwatch hours
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: TASK LIST VIEW                                        */}
      {/* ============================================================ */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Controls Bar: Department Pills, Search, Status Select, All/My switch */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border">
            {/* Department Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {departmentList.map((dept) => (
                <Button
                  key={dept}
                  type="button"
                  variant={selectedDepartment === dept ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`h-8 text-xs font-medium ${
                    selectedDepartment === dept ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dept}
                </Button>
              ))}
            </div>

            {/* Search, Status & View Filter */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs h-8 bg-background"
                />
              </div>

              {/* Status Select */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px] text-xs h-8 bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              {/* View Switch: All vs My Tasks */}
              <div className="flex items-center bg-background border rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAssignedView('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    assignedView === 'all'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedView('my')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    assignedView === 'my'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Tasks
                </button>
              </div>
            </div>
          </div>

          {/* Task Cards Grid OR Empty State */}
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  isAdminOrManager={isAdminOrManager}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setEditModalOpen(true);
                  }}
                  onDelete={(id) => deleteTask(id)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed py-12 text-center">
              <CardContent className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted/60 border flex items-center justify-center text-muted-foreground">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">No tasks found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {tasks.length === 0
                      ? 'All tasks have been removed. Click below to create your first task.'
                      : 'No tasks match your selected filter criteria. Try adjusting the department or status filter.'}
                  </p>
                </div>
                {isAdminOrManager && (
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 mt-2"
                    onClick={() => setActiveTab('new')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Task</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CREATE NEW TASK FORM (Admin / Manager Only)            */}
      {/* ============================================================ */}
      {activeTab === 'new' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Create New Task</CardTitle>
                <CardDescription className="text-xs">
                  Fill in the deliverable details to assign new work to team members.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('list')}
                className="text-xs h-8"
              >
                Back to Task List
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {!isAdminOrManager ? (
              <div className="p-8 text-center space-y-3">
                <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">Task Creation Restricted</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Team members cannot create tasks. Switch your simulated role to "Admin / Manager" in the top bar to create tasks.
                </p>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('list')}>
                  Return to Task List
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="space-y-5">
                {/* Task Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Task Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter task title (e.g. Conduct meeting with Jodo team)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description, requirements, or deliverables..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="text-xs"
                  />
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Words: {countWords(description)} / 1000
                    </span>
                  </div>
                </div>

                {/* Client Communication Brief */}
                <div className="space-y-1.5">
                  <Label htmlFor="clientBrief" className="text-xs font-semibold">
                    Client Communication Brief (Optional)
                  </Label>
                  <Textarea
                    id="clientBrief"
                    placeholder="Optional: add client call notes, discussion summary, approvals, or next steps..."
                    rows={3}
                    value={clientBrief}
                    onChange={(e) => setClientBrief(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Category, Priority, Status, Estimated Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Follow-ups">Follow-ups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Priority</Label>
                    <Select value={priority} onValueChange={(val: TaskPriority) => setPriority(val)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical (Urgent)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Status</Label>
                    <Select value={status} onValueChange={(val: TaskStatus) => setStatus(val)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Estimated Hours (Optional)</Label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="e.g. 4h 30m"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="pl-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Assign To */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assign To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder={staffLoading ? 'Loading team members...' : 'Select team member or assign to myself...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser && (
                        <SelectItem value={currentUser.id}>
                          Myself ({currentUser.name})
                        </SelectItem>
                      )}
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staff
                        .filter(u => u._id !== currentUser?.id && u.id !== currentUser?.id)
                        .map((u) => (
                          <SelectItem key={u._id || u.id} value={u._id || u.id}>
                            {u.name} {u.email ? `(${u.email})` : ''}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client & Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Client Name</Label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="e.g. Arbor Decor / Jodo Client"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="pl-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Project Name</Label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="e.g. JODO Ecommerce Website Development"
                        value={projectName}
                        onChange={(e) => handleProjectChange(e.target.value)}
                        className="pl-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Deliverable & Asset Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Project Deliverable <span className="text-muted-foreground text-[10px]">(Optional)</span>
                    </Label>
                    <Input
                      placeholder="e.g. Scope 1 Module Validation Report"
                      value={projectDeliverable}
                      onChange={(e) => setProjectDeliverable(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Drive / Asset Link <span className="text-muted-foreground text-[10px]">(Optional)</span>
                    </Label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Due Date & Urgent flag */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Due Date <span className="text-muted-foreground text-[10px]">(Optional)</span>
                    </Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="urgentCheckbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="urgentCheckbox" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                      Mark as Urgent Task
                    </label>
                  </div>
                </div>

                {/* Form Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('list')}
                    className="text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs px-5 font-semibold"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingTask(null);
        }}
        onTaskUpdated={() => fetchTasks()}
      />
    </div>
  );
}
