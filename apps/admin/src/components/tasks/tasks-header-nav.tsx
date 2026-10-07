'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Users2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function TasksHeaderNav() {
  const pathname = usePathname();
  const isTeamActive = pathname?.startsWith('/tasks/team-members');
  const isAiActive = pathname?.startsWith('/tasks/ai-analysis');
  const isTasksActive = !isTeamActive && !isAiActive;

  return (
    <div className="flex items-center gap-2 p-1 bg-muted/60 border border-border/80 rounded-xl w-fit shadow-xs">
      <Link
        href="/tasks"
        className={cn(
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
          isTasksActive
            ? 'bg-background text-foreground shadow-sm border border-border/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        )}
      >
        <CheckSquare className={cn('w-4 h-4', isTasksActive ? 'text-primary' : 'text-muted-foreground')} />
        <span>Tasks</span>
      </Link>

      <Link
        href="/tasks/team-members"
        className={cn(
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
          isTeamActive
            ? 'bg-background text-foreground shadow-sm border border-border/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        )}
      >
        <Users2 className={cn('w-4 h-4', isTeamActive ? 'text-primary' : 'text-muted-foreground')} />
        <span>Team Members</span>
      </Link>

      <Link
        href="/tasks/ai-analysis"
        className={cn(
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
          isAiActive
            ? 'bg-background text-foreground shadow-sm border border-border/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        )}
      >
        <Sparkles className={cn('w-4 h-4', isAiActive ? 'text-primary' : 'text-muted-foreground')} />
        <span>Task AI Analysis</span>
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/30 text-primary">
          AI
        </Badge>
      </Link>
    </div>
  );
}
