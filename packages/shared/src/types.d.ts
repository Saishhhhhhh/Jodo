export interface BaseDocument {
    _id: string;
    createdAt: string;
    updatedAt: string;
}
export type TenantStatus = 'active' | 'suspended' | 'cancelled';
export type TenantPlan = 'starter' | 'growth' | 'pro' | 'enterprise';
export interface Tenant extends BaseDocument {
    name: string;
    slug: string;
    plan: TenantPlan;
    status: TenantStatus;
    ownerUserId: string;
    billingEmail: string;
}
export type StoreStatus = 'active' | 'paused' | 'archived';
export interface Store extends BaseDocument {
    tenantId: string;
    name: string;
    slug: string;
    primaryDomain?: string;
    defaultCurrency: string;
    defaultCountry: string;
    timezone: string;
    status: StoreStatus;
    settings: Record<string, unknown>;
}
export type UserStatus = 'active' | 'invited' | 'suspended' | 'deactivated';
export interface User extends BaseDocument {
    tenantId: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    status: UserStatus;
    roles: string[];
    permissions: string[];
    lastLoginAt?: string;
    twoFactorEnabled: boolean;
}
export interface Role extends BaseDocument {
    tenantId: string;
    name: string;
    description?: string;
    permissions: string[];
    isSystemRole: boolean;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthUser extends User {
    store: Store;
    tenant: Tenant;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}
export interface PaginatedResponse<T = unknown> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}
export interface DashboardMetric {
    label: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'flat';
    format?: 'currency' | 'number' | 'percentage';
    currency?: string;
}
export interface DashboardSummary {
    totalRevenue: DashboardMetric;
    netRevenue: DashboardMetric;
    ordersToday: DashboardMetric;
    averageOrderValue: DashboardMetric;
    conversionRate: DashboardMetric;
    pendingFulfillments: DashboardMetric;
    lowStockProducts: DashboardMetric;
    returnedOrders: DashboardMetric;
    recentOrders: RecentOrder[];
    salesByDay: SalesByDay[];
    setupSteps?: { label: string; done: boolean; path: string }[];
}
export interface RecentOrder {
    _id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    currency: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
}
export interface SalesByDay {
    date: string;
    revenue: number;
    orders: number;
}
export type AuditActorType = 'user' | 'system' | 'api_key' | 'plugin';
export interface AuditLog extends BaseDocument {
    tenantId: string;
    storeId: string;
    actorUserId?: string;
    actorType: AuditActorType;
    action: string;
    resourceType: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
}
