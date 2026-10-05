import mongoose from 'mongoose';
export interface StockCalculationResult {
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    reorderLevel: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    statusLabel: 'In Stock' | 'Low Stock' | 'Out of Stock';
}
export interface AdjustStockParams {
    tenantId: string | mongoose.Types.ObjectId;
    storeId: string | mongoose.Types.ObjectId;
    sku: string;
    action: 'ADD_STOCK' | 'REMOVE_STOCK' | 'SET_STOCK' | 'UPDATE_REORDER_LEVEL';
    quantity: number;
    reason?: string;
    userId?: string | mongoose.Types.ObjectId;
    adminName?: string;
}
export declare class InventoryIntelligenceService {
    /**
     * Section 2: Core Stock Calculation
     * Available Stock = Total Stock (onHand) - Reserved Stock
     * Never allow Available Stock to become negative.
     *
     * IF Available Stock <= 0 -> OUT OF STOCK
     * ELSE IF Available Stock <= Reorder Level -> LOW STOCK
     * ELSE -> IN STOCK
     */
    static calculateStockStatus(item: {
        onHand?: number;
        reservedStock?: number;
        reorderLevel?: number;
        [key: string]: any;
    }): StockCalculationResult;
    /**
     * Section 6 & 7: Professional Stock Adjustment with Audit Trail
     * Supports: ADD_STOCK, REMOVE_STOCK, SET_STOCK, UPDATE_REORDER_LEVEL
     * Validates server-side, never trusts frontend quantities.
     * Creates an immutable audit trail in StockMovement.
     */
    static adjustStock(params: AdjustStockParams): Promise<{
        item: any;
        calculation: StockCalculationResult;
        auditRecord: any;
    }>;
    /**
     * Section 3 & 8: Atomic Stock Reservation for Orders
     * Customer places order -> Validate available stock -> Reserve required quantity
     * -> Increase Reserved Stock -> Available decreases atomically.
     */
    static reserveStockForOrder(tenantId: string | mongoose.Types.ObjectId, storeId: string | mongoose.Types.ObjectId, orderId: string | mongoose.Types.ObjectId, orderNumber: string, items: Array<{
        sku: string;
        quantity: number;
        productId?: any;
    }>): Promise<{
        success: boolean;
        reservedItems: {
            sku: string;
            quantity: number;
            reservationId: string;
        }[];
    }>;
    /**
     * Section 3: Release Reservation when order is cancelled, rejected, or refunded
     */
    static releaseOrderReservation(tenantId: string | mongoose.Types.ObjectId, storeId: string | mongoose.Types.ObjectId, orderId: string | mongoose.Types.ObjectId, reason?: string): Promise<{
        releasedCount: number;
    }>;
    /**
     * Section 3: Fulfill Order Reservation
     * Deducts onHand and releases reservedStock so Available Stock remains accurate without double deduction.
     */
    static fulfillOrderReservation(tenantId: string | mongoose.Types.ObjectId, storeId: string | mongoose.Types.ObjectId, orderId: string | mongoose.Types.ObjectId): Promise<{
        fulfilledCount: number;
    }>;
    /**
     * Phase 2 Demand Signals Helper
     */
    static calculateDemandSignal(unitsSoldLast30Days: number, openQuotationsQty?: number, pendingOrderQty?: number, leadCount?: number): string;
    static calculateEstimatedStockDays(availableStock: number, unitsSoldLast30Days: number): number | null;
    static isReorderRecommended(availableStock: number, demandLevel: string, estimatedDays: number | null): boolean;
}
