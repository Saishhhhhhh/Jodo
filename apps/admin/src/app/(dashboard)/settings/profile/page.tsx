'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { staffApi, mediaApi, getImageUrl, authApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Image as ImageIcon, Loader2, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  adminLogoUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { user, fetchMe } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!currentPassword) {
        throw new Error('Current password is required');
      }
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      return authApi.changePassword({ currentPassword, newPassword });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      setPasswordError(msg);
      toast.error(msg);
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    changePasswordMutation.mutate();
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatarUrl: '',
      adminLogoUrl: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        avatarUrl: user.avatarUrl || '',
        adminLogoUrl: (user as any).adminLogoUrl || '',
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user?.id) throw new Error('No user ID');
      return staffApi.update(user.id, data);
    },
    onSuccess: async () => {
      await fetchMe();
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await mediaApi.upload(formData);
      const url = response.data.data.url;
      form.setValue('adminLogoUrl', url, { shouldDirty: true });
      toast.success('Logo uploaded! Click save to apply.');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal information and preferences.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your basic profile details and contact information.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="pl-9"
                        {...form.register('name')}
                      />
                    </div>
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        className="pl-9"
                        {...form.register('email')}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your phone number"
                        className="pl-9"
                        {...form.register('phone')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-lg font-medium">Admin Panel Branding</h3>
            <p className="text-sm text-muted-foreground">
              Customize the logo that appears in your admin dashboard.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  <Label>Admin Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-32 border rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
                      {form.watch('adminLogoUrl') ? (
                        <img 
                          src={getImageUrl(form.watch('adminLogoUrl'))} 
                          alt="Admin Logo" 
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoUploading}
                      >
                        {logoUploading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                        ) : (
                          'Change Logo'
                        )}
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 200x60px. PNG or SVG.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-4 z-10 flex justify-end gap-4 mt-8 p-4 rounded-xl border bg-background/95 backdrop-blur-sm shadow-sm">
          <Button type="submit" disabled={updateProfileMutation.isPending || !form.formState.isDirty}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Separator className="my-8" />

      {/* Security and Change Password Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-lg font-medium">Security & Password</h3>
          <p className="text-sm text-muted-foreground">
            Update your account password to ensure your administrator access remains safe.
          </p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Passwords must contain at least 6 characters. You will need your current password to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password (min. 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                    className="gap-2"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
