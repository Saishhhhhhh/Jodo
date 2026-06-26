// ============================================================
// Core Types for Jodo Commerce OS
// ============================================================

// --- Base ---
export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// --- Tenant ---
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

// --- Store ---
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

// --- User / Staff ---
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

// --- Role ---
export interface Role extends BaseDocument {
  tenantId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
}

// --- Auth ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends User {
  store: Store;
  tenant: Tenant;
}

// --- API Responses ---
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

// --- Dashboard ---
export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number; // percentage change vs previous period
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
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface SalesByDay {
  date: string;
  revenue: number;
  orders: number;
}

// --- Audit Log ---
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
