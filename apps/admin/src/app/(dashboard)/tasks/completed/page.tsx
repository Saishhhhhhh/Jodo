'use client';

import React from 'react';
import { useTasksStore } from '@/stores/tasks';
import { TaskBoard } from '@/components/tasks/task-board';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { FileCheck } from 'lucide-react';

export default function CompletedTasksPage() {
  const { tasks: allTasks, fetchTasks } = useTasksStore();
  
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const completedTasks = allTasks.filter(t => t.status === 'Completed' || t.status === 'Closed');

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Completed Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Tasks that have been finished or closed.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskModal />
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <TaskBoard tasks={completedTasks} />
      </div>
    </div>
  );
}
