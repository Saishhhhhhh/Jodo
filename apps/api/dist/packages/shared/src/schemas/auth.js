"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordSchema = exports.CreateRoleSchema = exports.InviteStaffSchema = exports.RefreshTokenSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// --- Auth Schemas ---
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().min(2, 'Please enter a valid email or Member ID'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.InviteStaffSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Please enter a valid email address'),
    roleIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one role is required'),
});
exports.CreateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()),
});
exports.UpdatePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
//# sourceMappingURL=auth.js.map