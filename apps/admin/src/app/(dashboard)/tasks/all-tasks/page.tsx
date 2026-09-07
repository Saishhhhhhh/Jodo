'use client';

import React, { useState } from 'react';
import { useTasksStore } from '@/stores/tasks';
import { TaskBoard } from '@/components/tasks/task-board';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function AllTasksPage() {
  const { tasks: allTasks, fetchTasks } = useTasksStore();
  
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  const filteredTasks = allTasks.filter(t => {
    if (department !== 'All' && t.department !== department) return false;
    if (status !== 'All' && t.status !== status) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">All Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Organization-wide task visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskModal />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Departments</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Content">Content</SelectItem>
            <SelectItem value="Support">Support</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <TaskBoard tasks={filteredTasks} />
      </div>
    </div>
  );
}
