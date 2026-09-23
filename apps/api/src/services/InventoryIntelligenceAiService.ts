import OpenAI from 'openai';
import { env } from '../config/env';
import { Product } from '../models/Product';
import { InventoryItem } from '../models/InventoryItem';
import { Reservation } from '../models/Reservation';

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
   * Calculates actual stock metrics from CMS/database.
   * Calculations are strictly done on the backend (NOT by AI):
   * Available Stock = Total Stock - Reserved Stock
   * Status rules:
   *   If Available Stock <= 0 -> "Out of Stock"
   *   Else if Available Stock <= Reorder Level -> "Low Stock"
   *   Else -> "In Stock"
   */
  static async calculateInventoryData(storeId: string): Promise<{ summary: InventoryStockSummary; items: InventoryStockItem[] }> {
    const [products, inventoryItems, reservations] = await Promise.all([
      Product.find({ storeId }).lean(),
      InventoryItem.find({ storeId }).lean(),
      Reservation.find({ storeId, status: 'active' }).lean(),
    ]);

    const prodMap = new Map(products.map((p) => [p.sku, p]));
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
        onHand: 0,
        reservedStock: 0,
        reorderLevel: 10,
      };

      const totalStock = inv.onHand || 0;
      const reservedStock = Math.max(inv.reservedStock || 0, reservationBySku[prod.sku as string] || 0);
      const availableStock = Math.max(0, totalStock - reservedStock);
      const reorderLevel = inv.reorderLevel || 10;

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (availableStock <= 0) {
        status = 'Out of Stock';
        outOfStockCount++;
      } else if (availableStock <= reorderLevel) {
        status = 'Low Stock';
        lowStockCount++;
      }

      totalReservedSum += reservedStock;

      return {
        _id: String(inv._id || prod._id),
        productName: prod.title || 'Unknown Product',
        sku: prod.sku || 'N/A',
        imageUrl: prod.imageUrl,
        totalStock,
        reservedStock,
        availableStock,
        reorderLevel,
        status,
      };
    });

    const summary: InventoryStockSummary = {
      totalSkus: products.length,
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      totalReserved: totalReservedSum,
    };

    return { summary, items };
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
   * Generates AI stock analysis using OpenAI.
   * Sends only clean calculated inventory data:
   * [ { productName, sku, totalStock, reservedStock, availableStock, reorderLevel } ]
   */
  static async generateAiAnalysis(storeId: string): Promise<AiStockInsights> {
    const { items } = await this.calculateInventoryData(storeId);

    // Prepare clean data payload for OpenAI
    const payloadForAi = items.map((i) => ({
      productName: i.productName,
      sku: i.sku,
      totalStock: i.totalStock,
      reservedStock: i.reservedStock,
      availableStock: i.availableStock,
      reorderLevel: i.reorderLevel,
      status: i.status,
    }));

    const clients = getOrderedClients();
    if (clients.length === 0) {
      console.warn('[AI Inventory] No OpenAI API keys configured; generating fallback analysis.');
      const fallback = this.generateFallbackInsights(items);
      cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const systemPrompt = `You are an expert inventory analysis system. Analyze the provided stock data and identify risks (such as low stock and high reservations). Provide concise, clear, and actionable recommendations. Return strictly valid JSON.`;

    const userPrompt = `Here is the current inventory data:
${JSON.stringify(payloadForAi, null, 2)}

Return your analysis strictly as JSON matching this structure:
{
  "summary": "Overall inventory is healthy, but several products require attention.",
  "criticalItems": [
    {
      "sku": "SKU",
      "productName": "Product Name",
      "reason": "Stock is close to the reorder level",
      "recommendation": "Reorder inventory"
    }
  ],
  "recommendations": [
    "Reorder low-stock products",
    "Review products with high reserved quantities"
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
          summary: parsed.summary || 'Inventory analysis complete.',
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

        // Cache result
        cacheByStore.set(storeId, { data: result, timestamp: Date.now() });
        return result;
      } catch (err: any) {
        console.error(`[AI Inventory] Client #${i + 1} failed:`, err?.message || err);
        if (i === clients.length - 1) {
          throw new Error('Unable to generate inventory insights. Please try again.');
        }
      }
    }

    throw new Error('Unable to generate inventory insights. Please try again.');
  }

  /**
   * Deterministic fallback if API fails
   */
  private static generateFallbackInsights(items: InventoryStockItem[]): AiStockInsights {
    const critical = items
      .filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock' || i.reservedStock > 0)
      .slice(0, 3)
      .map((i) => ({
        sku: i.sku,
        productName: i.productName,
        reason: i.status === 'Low Stock' ? 'Available stock is below reorder level' : 'Units currently reserved for pending orders',
        recommendation: `Reorder ${Math.max(20, i.reorderLevel * 2)} units`,
      }));

    return {
      summary: 'Inventory is generally healthy. Products running near or below reorder levels should be reviewed for restocking.',
      criticalItems: critical,
      recommendations: [
        'Reorder low-stock products to maintain safety buffer',
        'Review products with high reserved quantities to ensure smooth order fulfillment',
      ],
    };
  }
}
