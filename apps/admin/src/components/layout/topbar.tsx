'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  PanelLeft,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <header className="flex items-center h-14 px-4 gap-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        {/* Sidebar Toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Search (decorative in Phase 0) */}
        <button className="flex items-center gap-2.5 flex-1 max-w-sm h-8 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground hover:bg-accent/40 transition-colors text-left">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Search...</span>
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            <span>⌘</span>K
          </kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-1.5 pr-2.5 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.name ? getInitials(user.name) : 'JD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium leading-none">{user?.name || 'Admin'}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Docs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
