'use client';

import React from 'react';
import { useTasksStore } from '@/stores/tasks';
import { TaskBoard } from '@/components/tasks/task-board';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Users2 } from 'lucide-react';

export default function TeamTasksPage() {
  const allTasks = useTasksStore(state => state.tasks);
  
  // Assuming current user is in 'Sales' department
  const teamTasks = allTasks.filter(t => t.department === 'Sales');

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Tasks assigned to your department (Sales).</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskModal />
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <TaskBoard tasks={teamTasks} />
      </div>
    </div>
  );
}
