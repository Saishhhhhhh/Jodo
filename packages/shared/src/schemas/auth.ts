import { z } from 'zod';

// --- Auth Schemas ---
export const LoginSchema = z.object({
  email: z.string().min(2, 'Please enter a valid email or Member ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const InviteStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  roleIds: z.array(z.string()).min(1, 'At least one role is required'),
});

export const CreateRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type InviteStaffInput = z.infer<typeof InviteStaffSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
