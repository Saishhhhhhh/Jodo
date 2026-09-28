export interface InventoryStockItem {
    _id: string;
    productName: string;
    sku: string;
    imageUrl?: string;
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    reorderLevel: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}
export interface InventoryStockSummary {
    totalSkus: number;
    outOfStock: number;
    lowStock: number;
    totalReserved: number;
}
export interface AiStockInsights {
    summary: string;
    criticalItems: Array<{
        sku: string;
        productName: string;
        reason: string;
        recommendation: string;
    }>;
    recommendations: string[];
}
export interface FullInventoryPayload {
    summary: InventoryStockSummary;
    items: InventoryStockItem[];
    latestAiInsights: AiStockInsights | null;
}
export declare class InventoryIntelligenceAiService {
    /**
     * Calculates actual stock metrics from CMS/database.
     * Calculations are strictly done on the backend (NOT by AI):
     * Available Stock = Total Stock - Reserved Stock
     * Status rules:
     *   If Available Stock <= 0 -> "Out of Stock"
     *   Else if Available Stock <= Reorder Level -> "Low Stock"
     *   Else -> "In Stock"
     */
    static calculateInventoryData(storeId: string): Promise<{
        summary: InventoryStockSummary;
        items: InventoryStockItem[];
    }>;
    /**
     * Retrieves full inventory payload with latest AI insights if cached.
     */
    static getFullInventory(storeId: string): Promise<FullInventoryPayload>;
    /**
     * Generates AI stock analysis using OpenAI.
     * Sends only clean calculated inventory data:
     * [ { productName, sku, totalStock, reservedStock, availableStock, reorderLevel } ]
     */
    static generateAiAnalysis(storeId: string): Promise<AiStockInsights>;
    /**
     * Deterministic fallback if API fails
     */
    private static generateFallbackInsights;
}
