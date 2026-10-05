import OpenAI from 'openai';
import { env } from '../config/env';
import { Product } from '../models/Product';
import { InventoryItem } from '../models/InventoryItem';
import { Reservation } from '../models/Reservation';
import { InventoryIntelligenceService } from './InventoryIntelligenceService';

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
  priorityTier?: 1 | 2 | 3 | 4;
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

// In-memory cache for latest AI analysis per store
const cacheByStore = new Map<string, { data: AiStockInsights; timestamp: number }>();

function getConfiguredKeys(): string[] {
  const candidates = [
    process.env.OPENAI_API_KEY,
    env.OPENAI_API_KEY_1,
    env.OPENAI_API_KEY_2,
    env.OPENAI_API_KEY_3,
    env.OPENAI_API_KEY_4,
  ];
  return candidates.filter(
    (k): k is string =>
      !!k &&
      k.trim().length > 0 &&
      !k.startsWith('your-openai-key')
  );
}

const keyClients: Map<string, OpenAI> = new Map();
function getClientForKey(key: string): OpenAI {
  if (!keyClients.has(key)) {
    keyClients.set(key, new OpenAI({ apiKey: key }));
  }
  return keyClients.get(key)!;
}

let rrIndex = 0;
function getOrderedClients(): OpenAI[] {
  const keys = getConfiguredKeys();
  if (keys.length === 0) return [];

  rrIndex = rrIndex % keys.length;
  const startIndex = rrIndex;
  rrIndex = (rrIndex + 1) % keys.length;

  const ordered: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    ordered.push(keys[(startIndex + i) % keys.length]);
  }
  return ordered.map(getClientForKey);
}

export class InventoryIntelligenceAiService {
  /**
   * Section 2 & 10: Calculates actual stock metrics from backend database.
   * AI must NEVER directly modify stock.
   * Calculations are strictly done on the backend:
   * Available Stock = Total Stock - Reserved Stock
   * Status rules:
   *   If Available Stock <= 0 -> "Out of Stock"
   *   Else if Available Stock <= Reorder Level -> "Low Stock"
   *   Else -> "In Stock"
   *
   * Priority ranking (Section 10):
   *   PRIORITY 1: Out of Stock + Reserved > 0 (Urgent backorder risk)
   *   PRIORITY 2: Out of Stock (Available <= 0)
   *   PRIORITY 3: Low Stock (Available <= Reorder Level)
   *   PRIORITY 4: High Reserved Stock
   */
  static async calculateInventoryData(storeId: string): Promise<{
    summary: InventoryStockSummary;
    items: InventoryStockItem[];
    criticalProducts: InventoryStockItem[];
  }> {
    const [products, inventoryItems, reservations] = await Promise.all([
      Product.find({ storeId }).lean(),
      InventoryItem.find({ storeId }).lean(),
      Reservation.find({ storeId, status: 'active' }).lean(),
    ]);

    const invMap = new Map(inventoryItems.map((i) => [i.sku, i]));

    // Aggregate active reservations per SKU
    const reservationBySku: Record<string, number> = {};
    for (const r of reservations) {
      if (r.sku) {
        reservationBySku[r.sku] = (reservationBySku[r.sku] || 0) + (r.reservedQuantity || 0);
      }
    }

    let outOfStockCount = 0;
    let lowStockCount = 0;
    let totalReservedSum = 0;

    const items: InventoryStockItem[] = products.map((prod) => {
      const inv = invMap.get(prod.sku as string) || {
        onHand: prod.inventoryQuantity || 0,
        reservedStock: 0,
        reorderLevel: 10,
      };

      const totalStock = Math.max(0, inv.onHand || 0);
      const reservedStock = Math.max(inv.reservedStock || 0, reservationBySku[prod.sku as string] || 0);
      const reorderLevel = inv.reorderLevel || 10;

      // Centralized canonical calculation
      const calc = InventoryIntelligenceService.calculateStockStatus({
        onHand: totalStock,
        reservedStock,
        reorderLevel,
      });

      if (calc.status === 'out_of_stock') {
        outOfStockCount++;
      } else if (calc.status === 'low_stock') {
        lowStockCount++;
      }

      totalReservedSum += reservedStock;

      // Priority ranking assignment (Section 10)
      let priorityTier: 1 | 2 | 3 | 4 | undefined;
      if (calc.availableStock <= 0 && reservedStock > 0) {
        priorityTier = 1;
      } else if (calc.availableStock <= 0) {
        priorityTier = 2;
      } else if (calc.availableStock <= reorderLevel) {
        priorityTier = 3;
      } else if (reservedStock > 0) {
        priorityTier = 4;
      }

      return {
        _id: String((inv as any)._id || prod._id),
        productName: prod.title || 'Unknown Product',
        sku: prod.sku || 'N/A',
        imageUrl: prod.imageUrl,
        totalStock: calc.totalStock,
        reservedStock: calc.reservedStock,
        availableStock: calc.availableStock,
        reorderLevel: calc.reorderLevel,
        status: calc.statusLabel,
        priorityTier,
      };
    });

    // Rank critical items (Section 10: top 3–5 items)
    const priorityItems = items
      .filter((i) => i.priorityTier !== undefined)
      .sort((a, b) => {
        const tierDiff = (a.priorityTier || 99) - (b.priorityTier || 99);
        if (tierDiff !== 0) return tierDiff;
        // If same tier, prioritize higher reserved or lower available
        return b.reservedStock - a.reservedStock || a.availableStock - b.availableStock;
      });

    const criticalProducts = priorityItems.slice(0, 5);

    const summary: InventoryStockSummary = {
      totalSkus: products.length,
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      totalReserved: totalReservedSum,
    };

    return { summary, items, criticalProducts };
  }

  /**
   * Retrieves full inventory payload with latest AI insights if cached.
   */
  static async getFullInventory(storeId: string): Promise<FullInventoryPayload> {
    const { summary, items } = await this.calculateInventoryData(storeId);
    const cached = cacheByStore.get(storeId);
    return {
      summary,
      items,
      latestAiInsights: cached ? cached.data : null,
    };
  }

  /**
   * Section 9 & 12: Generates AI stock analysis using OpenAI.
   * AI receives ONLY the compact structured summary calculated by the backend:
   * {
   *   "totalSKUs": number,
   *   "outOfStock": number,
   *   "lowStock": number,
   *   "reservedStock": number,
   *   "criticalProducts": [...]
   * }
   */
  static async generateAiAnalysis(storeId: string): Promise<AiStockInsights> {
    const { summary, criticalProducts } = await this.calculateInventoryData(storeId);

    // Section 9: Compact structured summary for OpenAI
    const structuredSummaryPayload = {
      totalSKUs: summary.totalSkus,
      outOfStock: summary.outOfStock,
      lowStock: summary.lowStock,
      reservedStock: summary.totalReserved,
      criticalProducts: criticalProducts.map((p) => ({
        sku: p.sku,
        productName: p.productName,
        totalStock: p.totalStock,
        reservedStock: p.reservedStock,
        availableStock: p.availableStock,
        reorderLevel: p.reorderLevel,
        priorityTier: p.priorityTier,
      })),
    };

    const clients = getOrderedClients();
    if (clients.length === 0) {
      console.warn('[AI Inventory] No OpenAI API keys configured; generating fallback analysis.');
      const fallback = this.generateFallbackInsights(summary, criticalProducts);
      cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const systemPrompt = `You are a professional e-commerce inventory intelligence assistant. Analyze the pre-calculated inventory metrics and provide:
1. Overall Stock Assessment (concise summary of catalog health)
2. Critical Stock Items (rank up to 5 critical SKUs with exact reasons and recommended reorder quantities)
3. Recommended Actions (3-4 high-impact tactical bullet points for the store operations team)

Return strictly valid JSON matching the requested structure. Keep responses concise, professional, and actionable.`;

    const userPrompt = `Here is the current backend inventory summary:
${JSON.stringify(structuredSummaryPayload, null, 2)}

Return strictly valid JSON matching this schema:
{
  "summary": "Overall inventory assessment...",
  "criticalItems": [
    {
      "sku": "SKU",
      "productName": "Product Name",
      "reason": "Specific issue description (e.g., Out of Stock with active customer orders reserved)",
      "recommendation": "Concrete action (e.g., Expedite purchase order for 25 units)"
    }
  ],
  "recommendations": [
    "Action item 1",
    "Action item 2"
  ]
}`;

    const modelToUse = env.OPENAI_MODEL || 'gpt-4o-mini';

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      try {
        const completion = await client.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1500,
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error('Empty response from OpenAI');

        const parsed = JSON.parse(raw);

        const result: AiStockInsights = {
          summary: parsed.summary || 'Inventory analysis completed successfully.',
          criticalItems: Array.isArray(parsed.criticalItems)
            ? parsed.criticalItems.map((ci: any) => ({
                sku: String(ci.sku || ''),
                productName: String(ci.productName || ci.title || ''),
                reason: String(ci.reason || ''),
                recommendation: String(ci.recommendation || ''),
              }))
            : [],
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.map(String)
            : [],
        };

        // Cache result per store
        cacheByStore.set(storeId, { data: result, timestamp: Date.now() });
        return result;
      } catch (err: any) {
        console.error(`[AI Inventory] OpenAI key #${i + 1} attempt failed:`, err?.message || err);
        if (i === clients.length - 1) {
          // If all keys fail, provide high-quality fallback based on calculated metrics
          console.warn('[AI Inventory] All OpenAI requests failed; returning fallback insights.');
          const fallback = this.generateFallbackInsights(summary, criticalProducts);
          cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
          return fallback;
        }
      }
    }

    const fallback = this.generateFallbackInsights(summary, criticalProducts);
    cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
    return fallback;
  }

  /**
   * Section 13: Deterministic fallback if OpenAI service is unavailable.
   * Ensures inventory management NEVER breaks or depends on third-party uptime.
   */
  private static generateFallbackInsights(
    summary: InventoryStockSummary,
    criticalProducts: InventoryStockItem[]
  ): AiStockInsights {
    const criticalItems = criticalProducts.map((p) => {
      let reason = 'Stock is below reorder threshold.';
      let recommendation = `Reorder ${Math.max(20, p.reorderLevel * 2)} units immediately.`;

      if (p.priorityTier === 1) {
        reason = `CRITICAL: Out of stock with ${p.reservedStock} units reserved for pending orders.`;
        recommendation = `Expedite purchase order for at least ${p.reservedStock + p.reorderLevel} units to fulfill backorders.`;
      } else if (p.priorityTier === 2) {
        reason = 'Product is completely out of stock with zero available inventory.';
        recommendation = `Restock ${Math.max(25, p.reorderLevel * 2)} units to resume fulfillment.`;
      } else if (p.priorityTier === 3) {
        reason = `Available stock (${p.availableStock}) is at or below reorder level (${p.reorderLevel}).`;
        recommendation = `Replenish ${Math.max(15, p.reorderLevel)} units to prevent stockout.`;
      } else if (p.priorityTier === 4) {
        reason = `High reservation volume (${p.reservedStock} units reserved) nearing total stock.`;
        recommendation = `Monitor fulfillment velocity and queue safety replenishment.`;
      }

      return {
        sku: p.sku,
        productName: p.productName,
        reason,
        recommendation,
      };
    });

    let overallSummary = 'Inventory health is balanced with adequate safety stock across active SKUs.';
    if (summary.outOfStock > 0 || summary.lowStock > 0) {
      overallSummary = `Catalog has ${summary.outOfStock} out-of-stock and ${summary.lowStock} low-stock SKUs requiring operational attention. Total reserved inventory is ${summary.totalReserved} units.`;
    }

    return {
      summary: overallSummary,
      criticalItems,
      recommendations: [
        summary.outOfStock > 0
          ? `Prioritize replenishment of ${summary.outOfStock} out-of-stock item(s) to avoid unfulfilled orders.`
          : 'Maintain current inventory buffer for fast-moving items.',
        summary.totalReserved > 0
          ? `Verify fulfillment pipeline for ${summary.totalReserved} currently reserved units.`
          : 'All inventory is currently unencumbered by pending reservations.',
        'Review supplier lead times for SKUs approaching reorder thresholds.',
      ],
    };
  }
}
