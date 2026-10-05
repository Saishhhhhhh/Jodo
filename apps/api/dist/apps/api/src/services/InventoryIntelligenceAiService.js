"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryIntelligenceAiService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const Product_1 = require("../models/Product");
const InventoryItem_1 = require("../models/InventoryItem");
const Reservation_1 = require("../models/Reservation");
// In-memory cache for latest AI analysis per store
const cacheByStore = new Map();
function getConfiguredKeys() {
    const candidates = [
        process.env.OPENAI_API_KEY,
        env_1.env.OPENAI_API_KEY_1,
        env_1.env.OPENAI_API_KEY_2,
        env_1.env.OPENAI_API_KEY_3,
        env_1.env.OPENAI_API_KEY_4,
    ];
    return candidates.filter((k) => !!k &&
        k.trim().length > 0 &&
        !k.startsWith('your-openai-key'));
}
const keyClients = new Map();
function getClientForKey(key) {
    if (!keyClients.has(key)) {
        keyClients.set(key, new openai_1.default({ apiKey: key }));
    }
    return keyClients.get(key);
}
let rrIndex = 0;
function getOrderedClients() {
    const keys = getConfiguredKeys();
    if (keys.length === 0)
        return [];
    rrIndex = rrIndex % keys.length;
    const startIndex = rrIndex;
    rrIndex = (rrIndex + 1) % keys.length;
    const ordered = [];
    for (let i = 0; i < keys.length; i++) {
        ordered.push(keys[(startIndex + i) % keys.length]);
    }
    return ordered.map(getClientForKey);
}
class InventoryIntelligenceAiService {
    /**
     * Calculates actual stock metrics from CMS/database.
     * Calculations are strictly done on the backend (NOT by AI):
     * Available Stock = Total Stock - Reserved Stock
     * Status rules:
     *   If Available Stock <= 0 -> "Out of Stock"
     *   Else if Available Stock <= Reorder Level -> "Low Stock"
     *   Else -> "In Stock"
     */
    static async calculateInventoryData(storeId) {
        const [products, inventoryItems, reservations] = await Promise.all([
            Product_1.Product.find({ storeId }).lean(),
            InventoryItem_1.InventoryItem.find({ storeId }).lean(),
            Reservation_1.Reservation.find({ storeId, status: 'active' }).lean(),
        ]);
        const prodMap = new Map(products.map((p) => [p.sku, p]));
        const invMap = new Map(inventoryItems.map((i) => [i.sku, i]));
        // Aggregate active reservations per SKU
        const reservationBySku = {};
        for (const r of reservations) {
            if (r.sku) {
                reservationBySku[r.sku] = (reservationBySku[r.sku] || 0) + (r.reservedQuantity || 0);
            }
        }
        let outOfStockCount = 0;
        let lowStockCount = 0;
        let totalReservedSum = 0;
        const items = products.map((prod) => {
            const inv = invMap.get(prod.sku) || {
                onHand: 0,
                reservedStock: 0,
                reorderLevel: 10,
            };
            const totalStock = inv.onHand || 0;
            const reservedStock = Math.max(inv.reservedStock || 0, reservationBySku[prod.sku] || 0);
            const availableStock = Math.max(0, totalStock - reservedStock);
            const reorderLevel = inv.reorderLevel || 10;
            let status = 'In Stock';
            if (availableStock <= 0) {
                status = 'Out of Stock';
                outOfStockCount++;
            }
            else if (availableStock <= reorderLevel) {
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
        const summary = {
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
    static async getFullInventory(storeId) {
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
    static async generateAiAnalysis(storeId) {
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
        const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const systemPrompt = `You are an expert inventory analysis and predictive forecasting system for JODO, an Indian furniture manufacturing brand. Analyze the provided stock data and identify risks (such as low stock and high reservations). 
Crucially, you MUST contextualize your analysis based on Indian customer sentiment, major upcoming Indian festivals (e.g., Diwali, Dussehra, Holi, Dhanteras), wedding seasons, and seasonal demand fluctuations relative to TODAY'S DATE. Provide concise, clear, and actionable recommendations on what to manufacture, restock, or push. Return strictly valid JSON.`;
        const userPrompt = `TODAY'S DATE IS: ${currentDate}.

Here is the current inventory data:
${JSON.stringify(payloadForAi, null, 2)}

Based on today's date (${currentDate}), upcoming Indian festivals/seasons, and typical Indian furniture buying behaviors, analyze the inventory data. DO NOT copy the example values below. Generate REAL, highly detailed insights specific to the data provided.

Return your analysis strictly as JSON matching this structure:
{
  "summary": "<Write a 2-3 paragraph detailed summary evaluating the current state of inventory, major risks, and strategic opportunities ahead of upcoming Indian festivals. Be extremely detailed.>",
  "criticalItems": [
    {
      "sku": "<Actual SKU>",
      "productName": "<Actual Product Name>",
      "reason": "<Provide a highly detailed, 2-sentence reason explaining why this item is at risk (e.g., low stock, high reservations) and contextualizing it with Indian consumer demand (e.g., this dining set is highly popular during wedding season)>",
      "recommendation": "<Provide a very specific, actionable recommendation (e.g., Immediate production of 150 units required)>"
    }
  ],
  "recommendations": [
    "<Provide a highly detailed, multi-sentence strategic recommendation for operations/marketing.>",
    "<Provide another detailed strategic recommendation.>"
  ]
}`;
        const modelToUse = env_1.env.OPENAI_MODEL || 'gpt-4o-mini';
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
                if (!raw)
                    throw new Error('Empty response from OpenAI');
                const parsed = JSON.parse(raw);
                const result = {
                    summary: parsed.summary || 'Inventory analysis complete.',
                    criticalItems: Array.isArray(parsed.criticalItems)
                        ? parsed.criticalItems.map((ci) => ({
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
            }
            catch (err) {
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
    static generateFallbackInsights(items) {
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
exports.InventoryIntelligenceAiService = InventoryIntelligenceAiService;
//# sourceMappingURL=InventoryIntelligenceAiService.js.map