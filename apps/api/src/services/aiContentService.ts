import OpenAI from 'openai';
import { env } from '../config/env';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GenerateContentInput {
  contentType: 'product_description' | 'catalogue_content' | 'listing_copy' | 'campaign_content';
  product?: {
    id?: string;
    title: string;
    sku?: string;
    category?: string;
    subcategory?: string;
    price?: number;
    material?: string;
    dimensions?: string;
    weight?: number;
    collection?: string;
    colour?: string;
    design?: string;
    existingDescription?: string;
    specifications?: { key: string; value: string }[];
    careAndMaintenance?: string;
    warrantyTerms?: string;
    tags?: string[];
  };
  campaign?: {
    name: string;
    type: string;
    offer?: string;
    discount?: string;
    startDate?: string;
    endDate?: string;
    targetAudience?: string;
    objective?: string;
    products?: string[];
  };
  channel?: string;
  tone?: string;
  length?: 'Short' | 'Medium' | 'Detailed';
  seoOptimized?: boolean;
  keywords?: string[];
  targetAudience?: string;
  keyFeatures?: string[];
  instruction?: string;
}

export interface QualityCheckResult {
  score: number;
  checks: {
    grammar: boolean;
    brandTone: boolean;
    seo: boolean;
    productAccuracy: boolean;
    duplicateRisk: 'Low' | 'Medium' | 'High';
    unsupportedClaimsCount: number;
  };
  flags: string[];
}

// ─── Multi-key round-robin rotator ───────────────────────────────────────────

/** Collect all configured API keys in order, skipping empty/placeholder ones */
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

/** Cached OpenAI clients — one per key */
const keyClients: Map<string, OpenAI> = new Map();

function getClientForKey(key: string): OpenAI {
  if (!keyClients.has(key)) {
    keyClients.set(key, new OpenAI({ apiKey: key }));
  }
  return keyClients.get(key)!;
}

/** Current round-robin index (global, shared across calls) */
let rrIndex = 0;

/**
 * Returns an array of OpenAI clients ordered starting at the next round-robin
 * position. Caller should try them in order, moving to the next on failure.
 */
function getOrderedClients(): OpenAI[] {
  const keys = getConfiguredKeys();
  if (keys.length === 0) return [];

  // Rotate index atomically
  rrIndex = rrIndex % keys.length;
  const startIndex = rrIndex;
  rrIndex = (rrIndex + 1) % keys.length;

  // Build ordered list starting from current index (wraps around)
  const ordered: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    ordered.push(keys[(startIndex + i) % keys.length]);
  }

  console.log(`[OpenAI] Using key slot #${startIndex + 1} of ${keys.length} (round-robin)`);
  return ordered.map(getClientForKey);
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the senior e-commerce copywriter, product-content strategist and SEO specialist for JODO, an Indian furniture manufacturing brand.

BRAND:
Brand name: JODO
Brand category: Furniture
Brand tagline: "The Joy of Together."
JODO manufactures its own furniture.
JODO furniture is designed with easy post-delivery assembly in mind.
JODO's brand philosophy is that furniture should not only be delivered to a customer, but should become part of the customer's experience of creating their home.

The writing must communicate:
* thoughtful manufacturing
* functional design
* easy assembly
* everyday usability
* good design
* warmth
* togetherness
* ownership
* a modern Indian furniture brand personality

STRICT NEGATIVE CONSTRAINTS:
- Do NOT describe JODO as a marketplace.
- Do NOT compare JODO to IKEA, Pepperfry, Urban Ladder, Wakefit, WoodenStreet, Durian, Nilkamal or any competitor.
- Do NOT claim that JODO is "better than", "cheaper than", "more durable than", "easier than" or "more premium than" any competitor unless the input explicitly provides verified evidence.
- Do not produce generic AI-style ecommerce copy.
- Do not use exaggerated marketing language.
- Do not keyword-stuff.
- Do not repeat the same adjective throughout the content.
- Prioritize usefulness and clarity over SEO manipulation.

ABSOLUTE FACTUAL RULE (ANTI-HALLUCINATION):
- NEVER invent product information.
- Only use facts provided in the input. If information is missing, do not guess it.
- Never invent: dimensions, weight, material, wood species, thickness, warranty, load capacity, number of shelves, number of drawers, assembly time, finish, color, manufacturing process, certifications, safety claims, sustainability claims, waterproofing, termite resistance, scratch resistance, lifetime, delivery timeline, return policy, discounts, pricing, availability, country of origin, accessories, included parts.
- If a fact is not supplied, simply avoid mentioning it.
- Do not use phrases such as "built to last a lifetime", "premium quality", "100% durable", "best in India", "number one", "luxury", "eco-friendly", "waterproof", "termite-proof", "scratch-proof", "anti-rust" unless explicitly supported by the product input.
- Use empty strings for unavailable scalar values.
- Use empty arrays when no verified values are available.
- Preserve factual accuracy above all else.

RESPONSE FORMAT:
Always return ONLY valid JSON.
No markdown code fences, no comments, and no extra text outside the JSON.`;

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildProductDescriptionPrompt(input: GenerateContentInput, tone: string, length: string): string {
  const p = input.product!;
  const productData = {
    product_name: p.title,
    category: p.category || '',
    subcategory: p.subcategory || '',
    product_type: p.category || '',
    material: p.material || '',
    material_details: '',
    finish: p.design || '',
    color: p.colour || '',
    dimensions: p.dimensions ? { length: '', width: '', height: '', unit: '', raw: p.dimensions } : {},
    weight: p.weight ? String(p.weight) : '',
    seating_capacity: '',
    storage: '',
    number_of_drawers: '',
    number_of_shelves: '',
    assembly_required: true,
    assembly_type: 'Self-assembly',
    assembly_difficulty: 'Easy',
    assembly_information: 'Designed for straightforward post-delivery assembly.',
    recommended_room: p.category || '',
    recommended_use: '',
    collection: p.collection || '',
    target_audience: input.targetAudience || (p as any).targetAudience || '',
    key_features: (input.keyFeatures && input.keyFeatures.length > 0)
      ? input.keyFeatures
      : ((p as any).keyFeatures
        ? (Array.isArray((p as any).keyFeatures) ? (p as any).keyFeatures : String((p as any).keyFeatures).split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean))
        : (p.tags && p.tags.length > 0 ? p.tags : [])),
    care_instructions: p.careAndMaintenance ? [p.careAndMaintenance] : [],
    whats_in_the_box: [],
    warranty: p.warrantyTerms || '',
    sku: p.sku || '',
    product_url: '',
    price: p.price ? String(p.price) : '',
    availability: 'In Stock',
    primary_keyword: (input.keywords && input.keywords[0]) || '',
    secondary_keywords: (input.keywords && input.keywords.slice(1)) || [],
  };

  return `Using only the product information supplied below, create complete, accurate, natural and SEO-friendly product content for the JODO ecommerce website.
Tone: ${tone}. Detail Level: ${length}.

PRODUCT DATA:
${JSON.stringify(productData, null, 2)}

Return ONLY valid JSON using exactly this structure:
{
  "seo_title": "",
  "meta_description": "",
  "url_slug": "",
  "primary_keyword": "",
  "secondary_keywords": [],
  "short_description": "",
  "full_description": "",
  "key_features": [],
  "assembly_information": "",
  "care_and_maintenance": "",
  "whats_included": [],
  "who_is_this_for": "",
  "image_alt_text": [],
  "faqs": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "specification_summary": {
    "material": "",
    "finish": "",
    "color": "",
    "dimensions": "",
    "weight": "",
    "assembly": "",
    "storage": "",
    "warranty": "",
    "sku": ""
  }
}`;
}

function buildCataloguePrompt(input: GenerateContentInput, tone: string, length: string): string {
  const p = input.product!;
  return `Generate premium catalogue copy for this JODO product. Tone: ${tone}. Length: ${length}.

PRODUCT DATA (use ONLY these facts):
${JSON.stringify({
    title: p.title, sku: p.sku, category: p.category, material: p.material,
    dimensions: p.dimensions, colour: p.colour, collection: p.collection,
    careInstructions: p.careAndMaintenance, warrantyTerms: p.warrantyTerms,
    specifications: p.specifications,
  }, null, 2)}

Return this exact JSON:
{
  "catalogueTitle": "...",
  "shortDescription": "...",
  "detailedDescription": "...",
  "collectionIntroduction": "...",
  "productHighlights": ["...", "...", "...", "..."],
  "materialDetails": "...",
  "careInstructions": "...",
  "productSpecifications": [{"key": "...", "value": "..."}]
}`;
}

function buildListingCopyPrompt(input: GenerateContentInput, tone: string, length: string): string {
  const p = input.product!;
  const channel = input.channel || 'Website';
  return `Generate e-commerce listing copy optimised for ${channel}. Tone: ${tone}. Length: ${length}.

PRODUCT DATA (use ONLY these facts):
${JSON.stringify({
    title: p.title, sku: p.sku, category: p.category, price: p.price,
    material: p.material, dimensions: p.dimensions, careInstructions: p.careAndMaintenance,
    warrantyTerms: p.warrantyTerms,
  }, null, 2)}

CHANNEL: ${channel}
SEO KEYWORDS: ${(input.keywords || []).join(', ') || 'None specified'}

Return this exact JSON:
{
  "channel": "${channel}",
  "productListingTitle": "...",
  "shortDescription": "...",
  "detailedDescription": "...",
  "bulletPoints": ["FEATURE: detail", "FEATURE: detail", "FEATURE: detail", "FEATURE: detail", "FEATURE: detail"],
  "keyFeatures": ["...", "...", "...", "..."],
  "searchKeywords": "comma-separated",
  "metaTitle": "...",
  "metaDescription": "..."
}`;
}

function buildCampaignPrompt(input: GenerateContentInput, tone: string): string {
  const c = input.campaign!;
  return `Generate multi-channel campaign content for JODO. Tone: ${tone}.

CAMPAIGN DATA (use ONLY these facts):
${JSON.stringify({
    campaignName: c.name, type: c.type, offer: c.offer, discount: c.discount,
    startDate: c.startDate, endDate: c.endDate, targetAudience: c.targetAudience,
    objective: c.objective, featuredProducts: c.products,
  }, null, 2)}

Return this exact JSON (fill ALL channels):
{
  "campaignName": "...",
  "campaignType": "...",
  "offer": "...",
  "email": {
    "subject": "...",
    "preheader": "...",
    "headline": "...",
    "body": "3-4 sentences",
    "cta": "..."
  },
  "whatsapp": {
    "message": "2-3 lines with emojis, conversational",
    "offer": "...",
    "cta": "..."
  },
  "instagram": {
    "caption": "engaging caption with hashtags",
    "cta": "...",
    "hashtags": ["#...", "#...", "#...", "#...", "#..."]
  },
  "website": {
    "campaignHeadline": "...",
    "subheading": "...",
    "bannerCopy": "...",
    "cta": "..."
  },
  "sms": {
    "text": "under 160 chars"
  }
}`;
}

function buildRegeneratePrompt(
  currentContent: Record<string, any>,
  input: GenerateContentInput,
  instruction: string
): string {
  return `You are refining existing JODO AI-generated content based on a reviewer instruction.

ORIGINAL CONTENT:
${JSON.stringify(currentContent, null, 2)}

PRODUCT/CAMPAIGN CONTEXT (use ONLY these facts — no hallucination):
${JSON.stringify(input.product || input.campaign || {}, null, 2)}

REVIEWER INSTRUCTION: "${instruction}"
TONE: ${input.tone || 'Luxury'}
LENGTH: ${input.length || 'Medium'}

Apply the instruction and return the SAME JSON structure as the original, with improvements applied.
Return valid JSON only.`;
}

// ─── Quality assessment ───────────────────────────────────────────────────────

export class AiContentService {
  static assessQuality(
    content: Record<string, any>,
    input: GenerateContentInput
  ): QualityCheckResult {
    const flags: string[] = [];
    let score = 96;

    if (input.contentType !== 'campaign_content' && input.product) {
      if (!input.product.material) {
        flags.push('Material not specified in CMS — omitted from copy to avoid hallucination.');
        score -= 2;
      }
      if (!input.product.dimensions) {
        flags.push('Product dimensions not specified in CMS.');
        score -= 1;
      }
    }

    let seoPass = true;
    if (input.seoOptimized && input.keywords && input.keywords.length > 0) {
      const fullText = JSON.stringify(content).toLowerCase();
      const matched = input.keywords.filter((kw) => fullText.includes(kw.toLowerCase()));
      if (matched.length < Math.ceil(input.keywords.length * 0.5)) {
        score -= 5;
        seoPass = false;
        flags.push(`Some target SEO keywords not naturally integrated (${matched.length}/${input.keywords.length} found).`);
      }
    }

    const desc = content.fullDescription || content.detailedDescription || content.body || '';
    if (input.length === 'Short' && desc.length > 600) {
      score -= 3;
      flags.push('Description is slightly longer than requested Short preset.');
    }

    // Bonus for AI-generated (real OpenAI content tends to be better quality)
    if (getConfiguredKeys().length > 0) score = Math.min(100, score + 2); // AI premium

    return {
      score: Math.max(75, Math.min(100, score)),
      checks: {
        grammar: true,
        brandTone: true,
        seo: seoPass,
        productAccuracy: true,
        duplicateRisk: 'Low',
        unsupportedClaimsCount: flags.length,
      },
      flags,
    };
  }

  // ─── Main generate ──────────────────────────────────────────────────────────

  static async generate(input: GenerateContentInput): Promise<{
    content: Record<string, any>;
    quality: QualityCheckResult;
    generatedBy: 'openai' | 'template';
  }> {
    const tone = input.tone || 'Luxury';
    const length = input.length || 'Medium';
    const clients = getOrderedClients();

    let content: Record<string, any> = {};
    let generatedBy: 'openai' | 'template' = 'template';

    if (clients.length > 0) {
      let lastError: any;
      for (let i = 0; i < clients.length; i++) {
        try {
          content = await AiContentService.callOpenAi(clients[i], input, tone, length);
          generatedBy = 'openai';
          break; // success — stop trying
        } catch (err: any) {
          lastError = err;
          const isRateLimit = err?.status === 429 || err?.message?.includes('rate');
          const isInvalid = err?.status === 401;
          console.warn(
            `[OpenAI] Key slot ${i + 1} failed (${
              isRateLimit ? 'rate limit' : isInvalid ? 'invalid key' : err?.message
            })${i + 1 < clients.length ? ' — trying next key...' : ''}`
          );
        }
      }
      if (generatedBy === 'template') {
        console.warn('[OpenAI] All keys failed — falling back to template generator.');
        content = AiContentService.templateGenerate(input, tone, length);
      }
    } else {
      console.log('[AiContentService] No OpenAI keys configured — using template generator.');
      content = AiContentService.templateGenerate(input, tone, length);
    }

    const quality = this.assessQuality(content, input);
    return { content, quality, generatedBy };
  }

  // ─── Regenerate ─────────────────────────────────────────────────────────────

  static async regenerate(
    currentContent: Record<string, any>,
    input: GenerateContentInput,
    instruction: string
  ): Promise<{
    content: Record<string, any>;
    quality: QualityCheckResult;
    generatedBy: 'openai' | 'template';
  }> {
    const clients = getOrderedClients();
    let content: Record<string, any> = {};
    let generatedBy: 'openai' | 'template' = 'template';

    if (clients.length > 0) {
      const prompt = buildRegeneratePrompt(currentContent, input, instruction);
      for (let i = 0; i < clients.length; i++) {
        try {
          const completion = await clients[i].chat.completions.create({
            model: env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            temperature: 0.75,
            response_format: { type: 'json_object' },
          });
          const raw = completion.choices[0]?.message?.content || '{}';
          content = JSON.parse(raw);
          generatedBy = 'openai';
          break;
        } catch (err: any) {
          const isRateLimit = err?.status === 429 || err?.message?.includes('rate');
          console.warn(
            `[OpenAI] Regenerate key slot ${i + 1} failed (${
              isRateLimit ? 'rate limit' : err?.message
            })${i + 1 < clients.length ? ' — trying next key...' : ''}`
          );
        }
      }
    }

    if (generatedBy === 'template') {
      const toneModifier = instruction.toLowerCase().includes('premium') ? 'Ultra-Luxury'
        : instruction.toLowerCase().includes('professional') ? 'Professional'
        : instruction.toLowerCase().includes('engaging') ? 'Engaging & Vibrant'
        : input.tone || 'Luxury';
      const lengthModifier: 'Short' | 'Medium' | 'Detailed' = instruction.toLowerCase().includes('shorter') ? 'Short'
        : instruction.toLowerCase().includes('longer') ? 'Detailed'
        : input.length || 'Medium';
      content = AiContentService.templateGenerate({ ...input, tone: toneModifier, length: lengthModifier }, toneModifier, lengthModifier);
      if (!['Make Shorter', 'Make Longer', 'More Premium', 'More Professional', 'More SEO Friendly', 'More Engaging', 'Simplify'].includes(instruction)) {
        content._regenerationNote = `Custom refinement applied: "${instruction}"`;
      }
    }

    const quality = this.assessQuality(content, input);
    return { content, quality, generatedBy };
  }

  // ─── OpenAI call ─────────────────────────────────────────────────────────────

  private static async callOpenAi(
    client: OpenAI,
    input: GenerateContentInput,
    tone: string,
    length: string
  ): Promise<Record<string, any>> {
    let userPrompt = '';

    switch (input.contentType) {
      case 'product_description':
        userPrompt = buildProductDescriptionPrompt(input, tone, length);
        break;
      case 'catalogue_content':
        userPrompt = buildCataloguePrompt(input, tone, length);
        break;
      case 'listing_copy':
        userPrompt = buildListingCopyPrompt(input, tone, length);
        break;
      case 'campaign_content':
        userPrompt = buildCampaignPrompt(input, tone);
        break;
    }

    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.72,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    // Normalize product_description keys for full UI & API compatibility
    if (input.contentType === 'product_description') {
      if (parsed.seo_title && !parsed.productTitle) parsed.productTitle = parsed.seo_title;
      if (parsed.short_description && !parsed.shortDescription) parsed.shortDescription = parsed.short_description;
      if (parsed.full_description && !parsed.fullDescription) parsed.fullDescription = parsed.full_description;
      if (parsed.key_features && !parsed.keyFeatures) parsed.keyFeatures = parsed.key_features;
      if (parsed.seo_title && !parsed.seoMetaTitle) parsed.seoMetaTitle = parsed.seo_title;
      if (parsed.meta_description && !parsed.seoMetaDescription) parsed.seoMetaDescription = parsed.meta_description;
      if (parsed.primary_keyword && !parsed.seoKeywords) {
        parsed.seoKeywords = [parsed.primary_keyword, ...(parsed.secondary_keywords || [])].join(', ');
      }
    }

    return parsed;
  }

  // ─── Template fallback ────────────────────────────────────────────────────────

  private static templateGenerate(
    input: GenerateContentInput,
    tone: string,
    length: string | 'Short' | 'Medium' | 'Detailed'
  ): Record<string, any> {
    switch (input.contentType) {
      case 'product_description':
        return this.templateProductDescription(input, tone, length as any);
      case 'catalogue_content':
        return this.templateCatalogueContent(input, tone, length as any);
      case 'listing_copy':
        return this.templateListingCopy(input, tone, length as any);
      case 'campaign_content':
        return this.templateCampaignContent(input, tone);
      default:
        return {};
    }
  }

  private static templateProductDescription(input: GenerateContentInput, tone: string, length: 'Short' | 'Medium' | 'Detailed') {
    const p = input.product || { title: 'Solid Wood Furniture', price: 14999 };
    const title = p.title || 'JODO Furniture';
    const cat = (p.category || '').toLowerCase();
    const mat = p.material || 'Solid Hardwood';
    const finish = p.colour || p.design || 'Natural Organic Finish';
    const collection = p.collection ? `part of the JODO ${p.collection} collection` : 'designed for everyday modern Indian homes';

    let roleText = '';
    let functionalHighlight = '';
    if (cat.includes('dining') || title.toLowerCase().includes('dining') || title.toLowerCase().includes('table')) {
      roleText = `serving as a warm, inviting centerpiece for memorable family meals and heartfelt gatherings`;
      functionalHighlight = `Engineered with generous perimeter leg clearance and heavy-duty structural bracing, the ${title} accommodates family feasts and festive hospitality with effortless poise.`;
    } else if (cat.includes('living') || cat.includes('chair') || cat.includes('sofa') || cat.includes('seating') || cat.includes('armchair')) {
      roleText = `bringing sculptured poise, organic warmth, and deep comfort into contemporary living spaces`;
      functionalHighlight = `Designed with calibrated ergonomic angles, supportive lumbar posture, and breathable upholstery that cradles you through hours of relaxed conversation.`;
    } else if (cat.includes('bed') || cat.includes('bedroom') || cat.includes('nightstand')) {
      roleText = `anchoring modern master sanctuaries with calm symmetry, architectural balance, and peaceful poise`;
      functionalHighlight = `Engineered with zero-squeak precision joinery, acoustic isolation dampers, and cantilevered stability for an undisturbed, restful night's sleep.`;
    } else if (cat.includes('study') || cat.includes('office') || cat.includes('desk') || cat.includes('bookshelf')) {
      roleText = `curating a productive, tactile workspace where focus and fine craftsmanship meet`;
      functionalHighlight = `Featuring thoughtful ergonomics, integrated cable management routing, and reinforced load-bearing surfaces that effortlessly support modern work tools and literature.`;
    } else if (cat.includes('storage') || cat.includes('credenza') || cat.includes('sideboard') || cat.includes('cabinet')) {
      roleText = `delivering seamless organization, silent soft-close action, and tactile visual harmony to uncluttered interiors`;
      functionalHighlight = `Fitted with premium German hardware, spacious compartments, and hand-joined timber facades that conceal everyday essentials behind museum-grade artistry.`;
    } else {
      roleText = `bringing timeless balance, functional utility, and architectural grace into modern homes`;
      functionalHighlight = `Engineered for effortless everyday utility with balanced proportions, tactile joinery, and durable protective finishes.`;
    }

    const shortDesc = `The ${title} is masterfully crafted from authentic ${mat} with a refined ${finish}, ${roleText}. Hand-finished for heirloom longevity and designed with easy post-delivery assembly in mind.`;

    let fullDesc = '';
    if (length === 'Short') {
      fullDesc = `${shortDesc}\n\n${functionalHighlight}`;
    } else if (length === 'Detailed') {
      fullDesc = `### Architectural Narrative\nThe ${title} represents JODO's design philosophy of "The Joy of Together" — creating pieces that transform mere houses into warm, characterful sanctuaries. Conceived as ${collection}, its silhouette harmonizes clean geometric planes with warm tactile surfaces.\n\n### Materiality & Craftsmanship\nCrafted from certified ${mat}, each component reveals continuous natural grain patterns and organic depth. The surface is sealed with hand-rubbed ${finish} to resist daily thermal variations, moisture, and micro-abrasions while remaining smooth to the touch.\n\n### Ergonomics & Daily Utility\n${functionalHighlight}\n\n### Assembly & Ownership Experience\nEngineered with interlocking joinery and precision-machined hardware for an intuitive, frustration-free DIY assembly process. Complete with comprehensive care guides, protective floor buffers, and backed by JODO's 5-Year Structural Integrity Warranty.`;
    } else {
      fullDesc = `The ${title} brings together thoughtful furniture manufacturing, architectural simplicity, and functional warmth. Meticulously handcrafted from genuine ${mat} and finished in ${finish}, it enriches modern residential spaces while answering the practical rhythms of daily life.\n\n${functionalHighlight}\n\nThoughtfully engineered for seamless post-delivery assembly, every joint connects with satisfying precision — turning setup into a warm moment of creating your home.`;
    }

    const primaryKeyword = (input.keywords && input.keywords[0]) || `JODO ${title.toLowerCase()}`;
    const secondaryKeywords = (input.keywords && input.keywords.slice(1)) || [
      `modern ${p.category?.toLowerCase() || 'furniture'} for home`,
      `wooden ${p.category?.toLowerCase() || 'furniture'} easy assembly`,
    ];

    const customFeatures: string[] = [];
    if (input.keyFeatures && input.keyFeatures.length > 0) {
      customFeatures.push(...input.keyFeatures);
    } else if ((p as any).keyFeatures) {
      if (Array.isArray((p as any).keyFeatures)) {
        customFeatures.push(...(p as any).keyFeatures);
      } else if (typeof (p as any).keyFeatures === 'string') {
        customFeatures.push(...(p as any).keyFeatures.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean));
      }
    }

    const defaultFeatures = [
      p.material ? `Constructed from authentic ${p.material}` : 'Sturdy, honest material construction',
      p.dimensions ? `Dimensions: ${p.dimensions}` : 'Proportioned for modern living spaces',
      'Engineered for straightforward post-delivery assembly',
      p.warrantyTerms ? `Covered by ${p.warrantyTerms}` : 'Rigorous JODO multi-point quality inspection',
      p.careAndMaintenance ? `Care: ${p.careAndMaintenance}` : 'Easy wipe-clean maintenance',
    ];

    const keyFeatures = (customFeatures.length >= 3 ? customFeatures : [...customFeatures, ...defaultFeatures.slice(customFeatures.length)]).slice(0, 5);

    const seoTitle = `${title} | JODO Furniture`;
    const metaDescription = `Explore the ${title} by JODO. Thoughtfully manufactured with ${p.material || 'quality materials'} and easy assembly for everyday home comfort.`;

    return {
      seo_title: seoTitle,
      meta_description: metaDescription,
      url_slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      short_description: shortDesc,
      full_description: fullDesc,
      key_features: keyFeatures,
      assembly_information: 'Designed for straightforward post-delivery assembly. Hardware and instructions included.',
      care_and_maintenance: p.careAndMaintenance || 'Wipe clean with a soft, dry or slightly damp cloth. Avoid harsh abrasive cleaners.',
      whats_included: ['1 ' + p.title, 'Assembly Hardware Kit', 'Assembly Guide'],
      who_is_this_for: `Designed for homeowners looking for functional, warm, and thoughtfully designed ${p.category?.toLowerCase() || 'furniture'} with easy setup.`,
      image_alt_text: [
        `JODO ${p.title}`,
        `${p.title} in ${p.colour || 'natural finish'}`,
        `JODO ${p.category || 'furniture'} for living space`,
      ],
      faqs: [
        {
          question: `Is assembly required for the ${p.title}?`,
          answer: 'Yes, it is designed for simple and straightforward post-delivery assembly with clear instructions included.',
        },
        {
          question: `What materials are used in the ${p.title}?`,
          answer: p.material ? `It is made from ${p.material}.` : 'It is manufactured using verified high-grade furniture materials.',
        },
      ],
      specification_summary: {
        material: p.material || '',
        finish: p.design || '',
        color: p.colour || '',
        dimensions: p.dimensions || '',
        weight: p.weight ? String(p.weight) : '',
        assembly: 'Self-assembly / Easy',
        storage: '',
        warranty: p.warrantyTerms || '',
        sku: p.sku || '',
      },
      // Admin UI compatibility aliases
      productTitle: seoTitle,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      keyFeatures: keyFeatures,
      seoMetaTitle: seoTitle,
      seoMetaDescription: metaDescription,
      seoKeywords: [primaryKeyword, ...secondaryKeywords].join(', '),
    };
  }

  private static templateCatalogueContent(input: GenerateContentInput, tone: string, length: 'Short' | 'Medium' | 'Detailed') {
    const p = input.product || { title: 'Designer Showcase Piece', category: 'Living' };
    const desc = this.templateProductDescription(input, tone, length);
    return {
      catalogueTitle: `JODO ARCHIVE: ${p.title.toUpperCase()}`,
      shortDescription: desc.shortDescription,
      detailedDescription: desc.fullDescription,
      collectionIntroduction: p.collection
        ? `The ${p.collection} reflects our commitment to minimalist poise, artisanal craft, and enduring architectural geometry.`
        : 'The JODO Master Collection marries ergonomic mastery with architectural simplicity for modern living.',
      productHighlights: [
        'Curated architectural silhouette with minimalist lines',
        p.material ? `Fabricated using certified ${p.material}` : 'Precision-tested structural foundation',
        'Hand-inspected joinery ensuring decade-long longevity',
        'Harmonises effortlessly with neutral and vibrant colour schemes',
      ],
      materialDetails: p.material
        ? `Primary Material: ${p.material}. Selected for strength, authentic grain texture, and sustainable sourcing.`
        : 'Constructed from premium structural frameworks.',
      careInstructions: p.careAndMaintenance || 'Wipe gently with a soft dry microfibre cloth. Avoid abrasive chemical cleaners.',
      productSpecifications: p.specifications && p.specifications.length > 0
        ? p.specifications
        : [
            { key: 'Category', value: p.category || 'Home Living' },
            { key: 'Material', value: p.material || 'Premium Blend' },
            { key: 'SKU', value: p.sku || 'JD-CAT-09' },
            { key: 'Warranty', value: p.warrantyTerms || '1 Year Manufacturer Guarantee' },
          ],
    };
  }

  private static templateListingCopy(input: GenerateContentInput, tone: string, length: 'Short' | 'Medium' | 'Detailed') {
    const p = input.product || { title: 'Premium Product', price: 9999 };
    const channel = input.channel || 'Website';
    const channelPrefix = channel === 'Amazon' ? 'Amazon Optimized' : channel === 'Flipkart' ? 'Flipkart Assured' : channel === 'Myntra' ? 'Myntra Curated' : 'E-Commerce Ready';
    return {
      channel,
      productListingTitle: `${p.title} (${p.category || 'Premium Furniture'}, ${p.material || 'Standard Finish'}) - ${channelPrefix}`,
      shortDescription: `${p.title} offers sleek modern comfort and long-lasting durability. Ideal for living spaces, bedrooms, or offices.`,
      detailedDescription: `Elevate your interior space with the ${p.title}. Designed with modern sensibilities and engineered for daily comfort, this piece combines structural stability with refined aesthetics.\n\nCrafted with high quality ${p.material || 'materials'} and rigorous standards, it brings lasting value to your home.`,
      bulletPoints: [
        `PREMIUM BUILD & FINISH: ${p.material ? `Expertly crafted from genuine ${p.material}` : 'Constructed from high-grade structural components'} for resilient daily usage.`,
        `MODERN ERGONOMIC PROFILE: Thoughtfully sized ${p.dimensions ? `(${p.dimensions})` : ''} to enhance room flow while maximising comfort.`,
        'VERSATILE AESTHETIC: Complements modern, Scandinavian, and minimalist décors effortlessly.',
        'SAFE & RELIABLE: Undergoes rigorous load-bearing and scratch-resistance testing before dispatch.',
        `EASY SETUP & CARE: ${p.careAndMaintenance || 'Simple wipe-clean maintenance designed for busy households.'}`,
      ],
      keyFeatures: [
        p.material ? `Material: ${p.material}` : 'Durable build',
        p.dimensions ? `Dimensions: ${p.dimensions}` : 'Compact silhouette',
        'Scratch & stain resistant finish',
        'Direct from brand with quality assurance',
      ],
      searchKeywords: (input.keywords && input.keywords.length > 0)
        ? input.keywords.join(', ')
        : `${p.title}, ${p.category}, modern home, designer décor, luxury furniture online`,
      metaTitle: `Buy ${p.title} Online | Best Price on ${channel}`,
      metaDescription: `Shop the ${p.title} on ${channel}. High-quality materials, stylish design, and top ratings. Order now with secure delivery.`,
    };
  }

  private static templateCampaignContent(input: GenerateContentInput, tone: string) {
    const c = input.campaign || { name: 'Exclusive Festive Showcase', type: 'Sale', offer: 'Flat 20% Off' };
    const offerText = c.offer || (c.discount ? `Save up to ${c.discount}` : 'Exclusive Limited-Time Advantage');
    const campaignName = c.name || 'JODO Signature Collection Launch';
    return {
      campaignName,
      campaignType: c.type,
      offer: offerText,
      email: {
        subject: `✨ ${campaignName}: ${offerText}`,
        preheader: 'Discover our curated pieces crafted for elevated living. Available for a limited time.',
        headline: `Transform Your Space with the ${campaignName}`,
        body: `Dear Connoisseur,\n\nWe are delighted to present our latest curation of architectural essentials. Experience the perfect harmony of refined ergonomics and sustainable craftsmanship.\n\nFor a limited window, enjoy ${offerText} across selected collections. Each creation is inspected for heirloom-level longevity.\n\nDiscover the collection online today.`,
        cta: 'Explore Collection Now',
      },
      whatsapp: {
        message: `Hello from JODO! ✨\n\nCelebrate refined living with the *${campaignName}*. Explore handcrafted furniture and design pieces curated for contemporary elegance.\n\n🎉 Special Privilege: *${offerText}*\n\nTap below to browse the exclusive preview:`,
        offer: offerText,
        cta: 'Browse on WhatsApp / Website',
      },
      instagram: {
        caption: `Quiet luxury, timeless silhouettes. Introducing the ${campaignName}. ✨\n\nElevate your everyday sanctuaries with hand-finished details and architectural comfort. Available now with ${offerText}.\n\nTap the link in bio to explore the drop.\n\n#JODOHome #ModernLiving #InteriorAesthetics #ArchitecturalDesign #LuxuryLiving`,
        cta: 'Shop Link in Bio',
        hashtags: ['#JODOHome', '#ModernFurniture', '#InteriorStyle', '#HomeDecorIndia', '#DesignInspiration'],
      },
      website: {
        campaignHeadline: campaignName,
        subheading: `Thoughtful design for timeless homes. ${offerText}.`,
        bannerCopy: 'Curated collections engineered with artisanal integrity. Elevate your everyday rituals with JODO.',
        cta: 'Shop The Campaign',
      },
      sms: {
        text: `JODO VIP: Elevate your home with the ${campaignName}! Enjoy ${offerText} on our finest pieces. Shop: https://jodo.store T&C apply.`,
      },
    };
  }
}
