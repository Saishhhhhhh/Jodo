'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                'bg-card border border-border text-card-foreground shadow-lg',
              title: 'text-sm font-semibold',
              description: 'text-xs text-muted-foreground',
              actionButton: 'bg-primary text-primary-foreground text-xs',
              cancelButton: 'bg-muted text-muted-foreground text-xs',
              error: '!border-destructive/50 !bg-destructive/10',
              success: '!border-green-500/50 !bg-green-500/10',
            },
          }}
          richColors
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
