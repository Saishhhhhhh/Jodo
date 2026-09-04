'use client';

import React, { useState } from 'react';
import { useTasksStore } from '@/stores/tasks';
import { TaskBoard } from '@/components/tasks/task-board';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MyTasksPage() {
  const allTasks = useTasksStore(state => state.tasks);
  // In a real app, 'Rahul' would be replaced by the current user's name/ID
  const currentUserTasks = allTasks.filter(t => t.assignedTo === 'Rahul');
  
  const [filter, setFilter] = useState('All');

  const filteredTasks = currentUserTasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return t.status === 'Completed' || t.status === 'Closed';
    if (filter === 'Overdue') return new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed';
    if (filter === 'Today') {
      const due = new Date(t.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString();
    }
    if (filter === 'Upcoming') {
      return new Date(t.dueDate) > new Date();
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tasks assigned to you.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <CreateTaskModal />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TaskBoard tasks={filteredTasks} />
      </div>
    </div>
  );
}
