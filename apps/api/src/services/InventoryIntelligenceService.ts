import { IInventoryItem } from '../models/InventoryItem';

export class InventoryIntelligenceService {
  /**
   * Calculates the available stock and stock status based on the business rules.
   * Available Stock = Total Stock (onHand) - Reserved Stock
   */
  static calculateStockStatus(item: any) {
    const onHand = item.onHand || 0;
    const reservedStock = item.reservedStock || 0;
    
    const availableStock = Math.max(0, onHand - reservedStock);
    const reorderLevel = item.reorderLevel || 10;
    
    let status = 'in_stock';
    if (availableStock <= 0) {
      status = 'out_of_stock';
    } else if (availableStock <= reorderLevel) {
      status = 'low_stock';
    }
    
    return {
      availableStock,
      status
    };
  }

  /**
   * Calculate demand level based on units sold and other factors.
   * 
   * Demand signals logic:
   * Low: 0-5
   * Medium: 6-20
   * High: 21-50
   * Very High: > 50
   */
  static calculateDemandSignal(
    unitsSoldLast30Days: number,
    openQuotationsQty: number = 0,
    pendingOrderQty: number = 0,
    leadCount: number = 0
  ) {
    // Simple heuristic combining recent sales with pipeline
    const score = unitsSoldLast30Days + (openQuotationsQty * 0.5) + (pendingOrderQty * 0.8) + (leadCount * 0.2);
    
    let level = 'Low';
    if (score > 50) level = 'Very High';
    else if (score > 20) level = 'High';
    else if (score > 5) level = 'Medium';
    
    return level;
  }

  static calculateEstimatedStockDays(availableStock: number, unitsSoldLast30Days: number): number | null {
    if (unitsSoldLast30Days <= 0) return null; // No sales, prevent division by zero
    const averageDailySales = unitsSoldLast30Days / 30;
    return Math.round(availableStock / averageDailySales);
  }

  static isReorderRecommended(availableStock: number, demandLevel: string, estimatedDays: number | null): boolean {
    const safetyPeriod = 14; // 14 days safety period
    if (availableStock <= 0) return true;
    
    if (demandLevel === 'High' || demandLevel === 'Very High') {
      if (estimatedDays !== null && estimatedDays < safetyPeriod) {
        return true;
      }
      if (availableStock < 10) return true; // Low absolute number
    }
    return false;
  }
}
