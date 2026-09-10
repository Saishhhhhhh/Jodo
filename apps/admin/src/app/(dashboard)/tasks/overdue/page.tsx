'use client';

import React from 'react';
import { useTasksStore } from '@/stores/tasks';
import { TaskBoard } from '@/components/tasks/task-board';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { ShieldAlert } from 'lucide-react';

export default function OverdueTasksPage() {
  const { tasks: allTasks, fetchTasks } = useTasksStore();
  
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const overdueTasks = allTasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed'
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Overdue Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Tasks that require immediate attention.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskModal />
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <TaskBoard tasks={overdueTasks} />
      </div>
    </div>
  );
}
