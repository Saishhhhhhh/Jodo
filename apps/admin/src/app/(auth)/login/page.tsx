'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Store, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { LoginSchema, type LoginInput } from '@jodo/shared';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get('email');
      const passParam = searchParams.get('password');
      if (emailParam) {
        form.setValue('email', emailParam);
      }
      if (passParam) {
        form.setValue('password', passParam);
      }
      if (emailParam || passParam) {
        // Clean URL to not expose credentials in browser history
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [form]);

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      
      toast.success('Welcome back!', { description: 'Redirecting to dashboard...' });
      
      if (user?.roles?.includes('TEAM_MEMBER')) {
        window.location.href = '/tasks/my-tasks';
      } else {
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error('Login failed', {
        description: error?.response?.data?.message || 'Invalid credentials.',
      });
    }
  };

  return (
    <div className="min-h-screen flex dark bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-card border-r border-border relative overflow-hidden p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center z-10">
          <img src="/logo.png" alt="Jodo" className="h-16 w-auto" />
        </div>

        {/* Center content */}
        <div className="relative z-10 mt-auto mb-auto">
          <h1 className="text-5xl font-bold text-foreground leading-tight">
            Login to Admin
          </h1>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-muted-foreground">
          Designed and developed by digital Vigyapan
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Jodo" className="h-10 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form
            method="POST"
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
            id="login-form"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@jodo.dev"
                autoComplete="email"
                autoFocus
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-destructive' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register('password')}
                  className={cn(
                    'pr-10',
                    form.formState.errors.password ? 'border-destructive' : ''
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gap-2 mt-2"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Dev hint */}
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground font-medium">Development credentials</p>
            <p className="text-xs text-muted-foreground mt-1">
              Email:{' '}
              <code className="text-foreground font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                admin@jodo.dev
              </code>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Password:{' '}
              <code className="text-foreground font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                Admin@123456
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
