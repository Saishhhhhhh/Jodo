"use strict";
// ============================================================
// App-wide constants for Jodo Commerce OS
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_COLORS = exports.PRODUCT_STATUSES = exports.PAYMENT_STATUSES = exports.FULFILLMENT_STATUSES = exports.ORDER_STATUSES = exports.PERMISSIONS = exports.SYSTEM_ROLES = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.DEFAULT_TIMEZONE = exports.DEFAULT_COUNTRY = exports.DEFAULT_CURRENCY = exports.APP_VERSION = exports.APP_DESCRIPTION = exports.APP_NAME = void 0;
exports.APP_NAME = 'Jodo';
exports.APP_DESCRIPTION = 'Headless Commerce OS';
exports.APP_VERSION = '0.1.0';
// --- Default values ---
exports.DEFAULT_CURRENCY = 'INR';
exports.DEFAULT_COUNTRY = 'IN';
exports.DEFAULT_TIMEZONE = 'Asia/Kolkata';
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// --- System Roles ---
exports.SYSTEM_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    STAFF: 'staff',
    VIEWER: 'viewer',
};
// --- Permissions ---
exports.PERMISSIONS = {
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
};
// --- Order States ---
exports.ORDER_STATUSES = [
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
];
// --- Fulfillment States ---
exports.FULFILLMENT_STATUSES = [
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
];
// --- Payment States ---
exports.PAYMENT_STATUSES = [
    'pending',
    'authorized',
    'captured',
    'partially_captured',
    'failed',
    'refunded',
    'partially_refunded',
    'cancelled',
    'voided',
];
// --- Product States ---
exports.PRODUCT_STATUSES = ['draft', 'active', 'archived', 'scheduled'];
// --- Status badge colors ---
exports.STATUS_COLORS = {
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
//# sourceMappingURL=constants.js.map