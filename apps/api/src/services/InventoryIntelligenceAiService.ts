import OpenAI from 'openai';
import { env } from '../config/env';
import { Product } from '../models/Product';
import { InventoryItem } from '../models/InventoryItem';
import { Reservation } from '../models/Reservation';
import { StockMovement } from '../models/StockMovement';
import { InventoryIntelligenceService } from './InventoryIntelligenceService';

export interface AiInventoryIntelligence {
  executiveSummary: string;
  healthScore: number;
  overallMetrics: {
    totalSKUs: number;
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;
    lowStockAlertsCount: number;
    healthyStockCount: number;
  };
  salesTeam: {
    readyToPitch: Array<{
      sku: string;
      productTitle: string;
      availableStock: number;
      category: string;
      pitchReason: string;
      targetAudience: string;
    }>;
    cautionWarnings: Array<{
      sku: string;
      productTitle: string;
      availableStock: number;
      reservedStock: number;
      warning: string;
      leadTimeBuffer: string;
    }>;
    substitutions: Array<{
      outOrLowStockSku: string;
      outOrLowStockTitle: string;
      recommendedAlternativeSku: string;
      recommendedAlternativeTitle: string;
      pitchPitch: string;
    }>;
    talkingPoints: string[];
  };
  operationsTeam: {
    criticalReorders: Array<{
      sku: string;
      productTitle: string;
      currentStock: number;
      reservedStock: number;
      availableStock: number;
      reorderLevel: number;
      suggestedPOQty: number;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      justification: string;
    }>;
    warehousePriorities: string[];
    stockoutRisks: Array<{
      sku: string;
      productTitle: string;
      estimatedDaysToStockout: number | string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
      notes: string;
    }>;
    actionPlan: string[];
  };
  analyzedAt: string;
  modelUsed: string;
}

// In-memory cache per storeId
const cacheByStore = new Map<string, { data: AiInventoryIntelligence; timestamp: number }>();

function getConfiguredKeys(): string[] {
  const candidates = [
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
   * Retrieves latest cached intelligence or generates a fresh one if none exists.
   */
  static async getIntelligence(storeId: string): Promise<AiInventoryIntelligence> {
    const cached = cacheByStore.get(storeId);
    if (cached) {
      return cached.data;
    }
    return this.generateIntelligence(storeId);
  }

  /**
   * Analyzes live CMS inventory and generates tailored intelligence for Sales & Operations
   * using OpenAI gpt-4o-mini.
   */
  static async generateIntelligence(storeId: string): Promise<AiInventoryIntelligence> {
    // 1. Gather all live data from database
    const [products, inventoryItems, reservations, movements] = await Promise.all([
      Product.find({ storeId }).lean(),
      InventoryItem.find({ storeId }).lean(),
      Reservation.find({ storeId, status: 'active' }).lean(),
      StockMovement.find({ storeId }).sort({ createdAt: -1 }).limit(30).lean(),
    ]);

    const prodMap = new Map(products.map((p) => [p.sku, p]));
    const invMap = new Map(inventoryItems.map((i) => [i.sku, i]));

    // 2. Build live inventory snapshot
    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let lowStockAlertsCount = 0;
    let healthyStockCount = 0;

    const inventorySnapshot = products.map((prod) => {
      const inv = invMap.get(prod.sku as string) || {
        onHand: 0,
        reservedStock: 0,
        reorderLevel: 10,
        status: 'out_of_stock',
        locationName: 'Main Warehouse',
      };

      const stats = InventoryIntelligenceService.calculateStockStatus(inv);
      const onHand = inv.onHand || 0;
      const reserved = inv.reservedStock || 0;
      const available = stats.availableStock;
      const reorderLevel = inv.reorderLevel || 10;

      totalOnHand += onHand;
      totalReserved += reserved;
      totalAvailable += available;

      if (stats.status === 'low_stock' || stats.status === 'out_of_stock') {
        lowStockAlertsCount++;
      } else {
        healthyStockCount++;
      }

      // Check active reservations for this sku
      const itemReservations = reservations
        .filter((r) => r.sku === prod.sku)
        .map((r) => ({
          qty: r.reservedQuantity,
          type: r.referenceType,
          refId: r.referenceId,
          expiresAt: r.expiryDate,
        }));

      // Check recent movements
      const recentMovs = movements
        .filter((m) => m.sku === prod.sku)
        .slice(0, 3)
        .map((m) => ({
          type: m.movementType,
          qty: m.quantity,
          ref: m.reference,
          date: m.createdAt,
        }));

      return {
        sku: prod.sku,
        title: prod.title,
        category: prod.category,
        price: prod.price,
        onHand,
        reserved,
        available,
        reorderLevel,
        status: stats.status,
        location: inv.locationName,
        activeReservations: itemReservations,
        recentMovements: recentMovs,
      };
    });

    const metrics = {
      totalSKUs: products.length,
      totalOnHand,
      totalReserved,
      totalAvailable,
      lowStockAlertsCount,
      healthyStockCount,
    };

    // 3. Call OpenAI gpt-4o-mini
    const clients = getOrderedClients();
    if (clients.length === 0) {
      console.warn('[AI Inventory] No OpenAI API keys configured; generating rule-based intelligence.');
      const fallback = this.generateRuleBasedFallback(inventorySnapshot, metrics);
      cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const systemPrompt = `You are the Chief Inventory & Supply Chain AI Strategist for JODO, an Indian modern furniture brand.
You analyze real-time CMS inventory, warehouse stock, active customer reservations, and demand signals to deliver crisp, actionable intelligence tailored specifically for two teams:
1. SALES TEAM: Closing orders and pitching furniture without causing stockouts or broken delivery promises.
2. OPERATIONS TEAM: Warehouse prioritization, purchase orders, reorder buffers, and risk mitigation.

You must return your analysis strictly as a valid JSON object matching the requested schema.`;

    const userPrompt = `Here is the current live CMS inventory data for JODO (${inventorySnapshot.length} products):
${JSON.stringify({ metrics, inventory: inventorySnapshot }, null, 2)}

Provide a thorough, expert intelligence briefing strictly as JSON with this exact structure:
{
  "executiveSummary": "2-3 high-impact sentences summarizing stock health, reservation bottlenecks, and biggest sales opportunities.",
  "healthScore": 85, // integer 0 to 100 assessing overall stock balance and risk
  "overallMetrics": {
    "totalSKUs": ${metrics.totalSKUs},
    "totalOnHand": ${metrics.totalOnHand},
    "totalReserved": ${metrics.totalReserved},
    "totalAvailable": ${metrics.totalAvailable},
    "lowStockAlertsCount": ${metrics.lowStockAlertsCount},
    "healthyStockCount": ${metrics.healthyStockCount}
  },
  "salesTeam": {
    "readyToPitch": [
      {
        "sku": "SKU",
        "productTitle": "Title",
        "availableStock": 80,
        "category": "Category",
        "pitchReason": "Why sales reps should push this right now (high stock, high margin, fast shipping)",
        "targetAudience": "E.g. Corporate offices, interior decorators, high-volume retail"
      }
    ],
    "cautionWarnings": [
      {
        "sku": "SKU",
        "productTitle": "Title",
        "availableStock": 3,
        "reservedStock": 7,
        "warning": "Specific warning for sales reps: e.g. Do not commit to same-week dispatch; verify warehouse balance before quoting.",
        "leadTimeBuffer": "E.g. Quote 3-4 weeks lead time for new bookings"
      }
    ],
    "substitutions": [
      {
        "outOrLowStockSku": "SKU of low stock item",
        "outOrLowStockTitle": "Title",
        "recommendedAlternativeSku": "SKU of well-stocked alternative",
        "recommendedAlternativeTitle": "Title of alternative",
        "pitchPitch": "Script or talking point explaining why this alternative is a great choice"
      }
    ],
    "talkingPoints": [
      "Key bullet points sales reps can use when discussing delivery schedules and availability with clients."
    ]
  },
  "operationsTeam": {
    "criticalReorders": [
      {
        "sku": "SKU",
        "productTitle": "Title",
        "currentStock": 10,
        "reservedStock": 7,
        "availableStock": 3,
        "reorderLevel": 10,
        "suggestedPOQty": 30,
        "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "justification": "Why this reorder quantity is needed right now"
      }
    ],
    "warehousePriorities": [
      "Clear, actionable tasks for warehouse staff (e.g. stage reserved units, inspect packaging, optimize bin location)."
    ],
    "stockoutRisks": [
      {
        "sku": "SKU",
        "productTitle": "Title",
        "estimatedDaysToStockout": "4-7 days",
        "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
        "notes": "Reason for risk level"
      }
    ],
    "actionPlan": [
      "Immediate operational steps for procurement, logistics, and warehouse management."
    ]
  }
}`;

    const modelToUse = env.OPENAI_MODEL || 'gpt-4o-mini';

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      try {
        console.log(`[AI Inventory] Requesting intelligence using ${modelToUse} (client #${i + 1})...`);
        const completion = await client.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 2500,
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error('Empty response from OpenAI');

        const parsed = JSON.parse(raw);

        const result: AiInventoryIntelligence = {
          executiveSummary: parsed.executiveSummary || 'Inventory analysis complete.',
          healthScore: typeof parsed.healthScore === 'number' ? parsed.healthScore : 80,
          overallMetrics: {
            totalSKUs: metrics.totalSKUs,
            totalOnHand: metrics.totalOnHand,
            totalReserved: metrics.totalReserved,
            totalAvailable: metrics.totalAvailable,
            lowStockAlertsCount: metrics.lowStockAlertsCount,
            healthyStockCount: metrics.healthyStockCount,
          },
          salesTeam: {
            readyToPitch: Array.isArray(parsed.salesTeam?.readyToPitch) ? parsed.salesTeam.readyToPitch : [],
            cautionWarnings: Array.isArray(parsed.salesTeam?.cautionWarnings) ? parsed.salesTeam.cautionWarnings : [],
            substitutions: Array.isArray(parsed.salesTeam?.substitutions) ? parsed.salesTeam.substitutions : [],
            talkingPoints: Array.isArray(parsed.salesTeam?.talkingPoints) ? parsed.salesTeam.talkingPoints : [],
          },
          operationsTeam: {
            criticalReorders: Array.isArray(parsed.operationsTeam?.criticalReorders) ? parsed.operationsTeam.criticalReorders : [],
            warehousePriorities: Array.isArray(parsed.operationsTeam?.warehousePriorities) ? parsed.operationsTeam.warehousePriorities : [],
            stockoutRisks: Array.isArray(parsed.operationsTeam?.stockoutRisks) ? parsed.operationsTeam.stockoutRisks : [],
            actionPlan: Array.isArray(parsed.operationsTeam?.actionPlan) ? parsed.operationsTeam.actionPlan : [],
          },
          analyzedAt: new Date().toISOString(),
          modelUsed: modelToUse,
        };

        // Cache result
        cacheByStore.set(storeId, { data: result, timestamp: Date.now() });
        return result;
      } catch (err: any) {
        console.error(`[AI Inventory] Client #${i + 1} failed:`, err?.message || err);
        if (i === clients.length - 1) {
          console.warn('[AI Inventory] All OpenAI clients failed. Falling back to rule-based intelligence.');
          const fallback = this.generateRuleBasedFallback(inventorySnapshot, metrics);
          cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
          return fallback;
        }
      }
    }

    const fallback = this.generateRuleBasedFallback(inventorySnapshot, metrics);
    cacheByStore.set(storeId, { data: fallback, timestamp: Date.now() });
    return fallback;
  }

  /**
   * Deterministic rule-based fallback if OpenAI is unavailable.
   */
  private static generateRuleBasedFallback(
    inventory: any[],
    metrics: {
      totalSKUs: number;
      totalOnHand: number;
      totalReserved: number;
      totalAvailable: number;
      lowStockAlertsCount: number;
      healthyStockCount: number;
    }
  ): AiInventoryIntelligence {
    const readyToPitch = inventory
      .filter((i) => i.available >= 20)
      .sort((a, b) => b.available - a.available)
      .slice(0, 4)
      .map((i) => ({
        sku: i.sku,
        productTitle: i.title,
        availableStock: i.available,
        category: i.category,
        pitchReason: `High stock level (${i.available} units available) enables guaranteed immediate dispatch.`,
        targetAudience: 'General residential and contract commercial projects',
      }));

    const cautionWarnings = inventory
      .filter((i) => i.available <= i.reorderLevel || i.reserved > 0)
      .slice(0, 4)
      .map((i) => ({
        sku: i.sku,
        productTitle: i.title,
        availableStock: i.available,
        reservedStock: i.reserved,
        warning: `Limited availability (${i.available} left, ${i.reserved} locked in reservations). Avoid promising instant delivery.`,
        leadTimeBuffer: 'Provide 3-4 week lead time for new purchase orders.',
      }));

    const criticalReorders = inventory
      .filter((i) => i.available <= i.reorderLevel)
      .map((i) => ({
        sku: i.sku,
        productTitle: i.title,
        currentStock: i.onHand,
        reservedStock: i.reserved,
        availableStock: i.available,
        reorderLevel: i.reorderLevel,
        suggestedPOQty: Math.max(25, i.reorderLevel * 3 - i.available),
        priority: (i.available <= 3 ? 'CRITICAL' : 'HIGH') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
        justification: `Available stock (${i.available}) has breached safety threshold (${i.reorderLevel}).`,
      }));

    return {
      executiveSummary: `Warehouse currently holds ${metrics.totalAvailable} available units across ${metrics.totalSKUs} SKUs. ${metrics.lowStockAlertsCount} items require immediate replenishment attention due to active customer reservations.`,
      healthScore: Math.max(50, Math.round(100 - (metrics.lowStockAlertsCount / (metrics.totalSKUs || 1)) * 40)),
      overallMetrics: metrics,
      salesTeam: {
        readyToPitch,
        cautionWarnings,
        substitutions: [
          {
            outOrLowStockSku: 'FURN-DT-02',
            outOrLowStockTitle: 'Luxury Marble Dining Table',
            recommendedAlternativeSku: 'FURN-DT-01',
            recommendedAlternativeTitle: 'Modern Oak Dining Table',
            pitchPitch: 'Offer the Modern Oak Dining Table as an immediate in-stock premium option with zero delivery delay.',
          },
        ],
        talkingPoints: [
          'Direct customer focus toward Office Chairs and Coffee Tables for fast 48-hour delivery.',
          'Always check reserved stock balance before confirming multi-unit orders for Dining Tables.',
        ],
      },
      operationsTeam: {
        criticalReorders,
        warehousePriorities: [
          'Stage reserved units for prompt courier pickup.',
          'Audit physical stock against CMS inventory levels for low-stock SKUs.',
        ],
        stockoutRisks: criticalReorders.map((r) => ({
          sku: r.sku,
          productTitle: r.productTitle,
          estimatedDaysToStockout: r.priority === 'CRITICAL' ? '2-4 days' : '5-8 days',
          riskLevel: r.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          notes: 'High demand coupled with low buffer inventory.',
        })),
        actionPlan: [
          'Issue purchase orders for flagged critical items.',
          'Review active reservations nearing expiry dates to release unconfirmed stock.',
        ],
      },
      analyzedAt: new Date().toISOString(),
      modelUsed: 'heuristic-engine',
    };
  }
}
