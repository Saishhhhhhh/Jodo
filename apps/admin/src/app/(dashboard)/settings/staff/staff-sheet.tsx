'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { staffApi } from '@/lib/api-client';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  status: z.string().default('active'),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffUser?: any | null; // Pass user data when editing
}

export function StaffSheet({ open, onOpenChange, staffUser }: StaffSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!staffUser;

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await staffApi.roles();
      return response.data.data;
    },
  });

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
      status: 'active',
    },
  });

  // Reset form when staffUser changes or modal opens
  useEffect(() => {
    if (staffUser && open) {
      form.reset({
        name: staffUser.name,
        email: staffUser.email,
        password: '',
        roleId: staffUser.roleIds?.[0]?._id || '',
        status: staffUser.status || 'active',
      });
    } else if (open && !staffUser) {
      form.reset({
        name: '',
        email: '',
        password: '',
        roleId: '',
        status: 'active',
      });
    }
  }, [staffUser, open, form]);

  const createMutation = useMutation({
    mutationFn: async (values: StaffFormValues) => {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        roleIds: [values.roleId],
      };
      return staffApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member added successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: StaffFormValues) => {
      const payload = {
        name: values.name,
        email: values.email,
        roleIds: [values.roleId],
        status: values.status,
      };
      return staffApi.update(staffUser._id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    },
  });

  function onSubmit(data: StaffFormValues) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      if (!data.password) {
        form.setError('password', { message: 'Password is required for new staff' });
        return;
      }
      createMutation.mutate(data);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the details and permissions for this staff member.'
              : 'Add a new staff member to your store. They will use these credentials to log in.'}
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a secure password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rolesData?.map((role: any) => (
                          <SelectItem key={role._id} value={role._id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Staff Member'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
