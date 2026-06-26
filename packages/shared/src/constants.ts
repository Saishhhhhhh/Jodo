// ============================================================
// App-wide constants for Jodo Commerce OS
// ============================================================

export const APP_NAME = 'Jodo';
export const APP_DESCRIPTION = 'Headless Commerce OS';
export const APP_VERSION = '0.1.0';

// --- Default values ---
export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_COUNTRY = 'IN';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// --- System Roles ---
export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

// --- Permissions ---
export const PERMISSIONS = {
  // Products
  READ_PRODUCTS: 'read_products',
  WRITE_PRODUCTS: 'write_products',
  DELETE_PRODUCTS: 'delete_products',
  // Orders
  READ_ORDERS: 'read_orders',
  WRITE_ORDERS: 'write_orders',
  CANCEL_ORDERS: 'cancel_orders',
  REFUND_ORDERS: 'refund_orders',
  // Customers
  READ_CUSTOMERS: 'read_customers',
  WRITE_CUSTOMERS: 'write_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  EXPORT_CUSTOMERS: 'export_customers',
  // Inventory
  READ_INVENTORY: 'read_inventory',
  WRITE_INVENTORY: 'write_inventory',
  // Discounts
  READ_DISCOUNTS: 'read_discounts',
  WRITE_DISCOUNTS: 'write_discounts',
  // Payments
  READ_PAYMENTS: 'read_payments',
  WRITE_PAYMENTS: 'write_payments',
  // Analytics
  READ_ANALYTICS: 'read_analytics',
  // Staff
  MANAGE_STAFF: 'manage_staff',
  MANAGE_ROLES: 'manage_roles',
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_BILLING: 'manage_billing',
  // Apps
  MANAGE_APPS: 'manage_apps',
  // Audit
  READ_AUDIT_LOGS: 'read_audit_logs',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// --- Order States ---
export const ORDER_STATUSES = [
  'draft',
  'pending_payment',
  'payment_failed',
  'paid',
  'partially_paid',
  'confirmed',
  'processing',
  'partially_fulfilled',
  'fulfilled',
  'partially_refunded',
  'refunded',
  'cancelled',
  'returned',
  'closed',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// --- Fulfillment States ---
export const FULFILLMENT_STATUSES = [
  'unfulfilled',
  'scheduled',
  'on_hold',
  'partially_fulfilled',
  'fulfilled',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned_to_origin',
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

// --- Payment States ---
export const PAYMENT_STATUSES = [
  'pending',
  'authorized',
  'captured',
  'partially_captured',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled',
  'voided',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// --- Product States ---
export const PRODUCT_STATUSES = ['draft', 'active', 'archived', 'scheduled'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// --- Status badge colors ---
export const STATUS_COLORS: Record<string, string> = {
  // positive
  active: 'green',
  paid: 'green',
  fulfilled: 'green',
  delivered: 'green',
  captured: 'green',
  // warning
  pending: 'yellow',
  pending_payment: 'yellow',
  processing: 'yellow',
  in_transit: 'yellow',
  partially_fulfilled: 'yellow',
  // destructive
  cancelled: 'red',
  refunded: 'red',
  payment_failed: 'red',
  failed: 'red',
  // neutral
  draft: 'gray',
  archived: 'gray',
  closed: 'gray',
};
