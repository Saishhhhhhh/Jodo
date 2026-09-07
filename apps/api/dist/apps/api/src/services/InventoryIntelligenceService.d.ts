export declare class InventoryIntelligenceService {
    /**
     * Calculates the available stock and stock status based on the business rules.
     * Available Stock = Total Stock (onHand) - Reserved Stock
     */
    static calculateStockStatus(item: any): {
        availableStock: number;
        status: string;
    };
    /**
     * Calculate demand level based on units sold and other factors.
     *
     * Demand signals logic:
     * Low: 0-5
     * Medium: 6-20
     * High: 21-50
     * Very High: > 50
     */
    static calculateDemandSignal(unitsSoldLast30Days: number, openQuotationsQty?: number, pendingOrderQty?: number, leadCount?: number): string;
    static calculateEstimatedStockDays(availableStock: number, unitsSoldLast30Days: number): number | null;
    static isReorderRecommended(availableStock: number, demandLevel: string, estimatedDays: number | null): boolean;
}
