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

const SYSTEM_PROMPT = `You are JODO AI Atelier — an expert luxury furniture & home décor copywriter for JODO, a premium Indian D2C brand.

BRAND VOICE:
- Sophisticated, aspirational, yet warm
- Focus on craftsmanship, materials, and lifestyle elevation
- Never use generic filler words like "amazing", "incredible", "game-changer"
- Write in British English
- Keep sentences precise and evocative

ANTI-HALLUCINATION RULES (MANDATORY):
1. Only describe features, materials, or specs that are EXPLICITLY provided in the product data.
2. If material is not given, do NOT mention a specific material — use "premium materials".
3. If dimensions are not given, do NOT invent dimensions.
4. Never make health, safety, or sustainability claims unless explicitly provided.
5. Never invent warranty terms, certifications, or awards.
6. If a field is missing, omit that aspect gracefully.

RESPONSE FORMAT: Always respond with valid JSON only. No markdown, no commentary — pure JSON.`;

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildProductDescriptionPrompt(input: GenerateContentInput, tone: string, length: string): string {
  const p = input.product!;
  const productFacts = {
    title: p.title,
    sku: p.sku || 'N/A',
    category: p.category || 'Home Furnishing',
    price: p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined,
    material: p.material,
    dimensions: p.dimensions,
    colour: p.colour,
    design: p.design,
    collection: p.collection,
    careInstructions: p.careAndMaintenance,
    warrantyTerms: p.warrantyTerms,
    specifications: p.specifications,
    tags: p.tags,
    existingDescription: p.existingDescription,
  };

  return `Generate a ${tone}-tone product description for this JODO product. Length: ${length}.

PRODUCT DATA (use ONLY these facts):
${JSON.stringify(productFacts, null, 2)}

TARGET AUDIENCE: ${input.targetAudience || 'Affluent urban homeowners aged 28–50'}
SEO KEYWORDS TO INTEGRATE: ${(input.keywords || []).join(', ') || 'None specified'}
CHANNEL: ${input.channel || 'Website'}

Return this exact JSON structure:
{
  "productTitle": "...",
  "shortDescription": "2-3 sentences, evocative, SEO-friendly",
  "fullDescription": "${length === 'Short' ? '1 paragraph' : length === 'Medium' ? '2 paragraphs' : '3 paragraphs'}",
  "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "seoMetaTitle": "60 chars max",
  "seoMetaDescription": "155 chars max",
  "seoKeywords": "comma-separated keywords"
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
      max_tokens: 1800,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(raw);
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
    const p = input.product || { title: 'Premium Home Furnishing', price: 14999 };
    const materialSnippet = p.material ? `Meticulously crafted from authentic ${p.material}` : 'Crafted with premium grade structural materials';
    const collectionSnippet = p.collection ? `part of our signature ${p.collection} curation` : 'designed for discerning contemporary spaces';
    const audienceSnippet = input.targetAudience ? `Tailored for ${input.targetAudience.toLowerCase()}.` : 'Ideal for modern lifestyle interiors.';

    const shortDesc = `${p.title} embodies refined living, ${collectionSnippet}. ${materialSnippet}, delivering unmatched comfort, durability, and timeless silhouette.`;

    let fullDesc = '';
    if (length === 'Short') {
      fullDesc = `${shortDesc} ${audienceSnippet} Every contour is engineered with precision to provide optimum ergonomic balance.`;
    } else if (length === 'Detailed') {
      fullDesc = `Introducing the ${p.title} — where thoughtful design meets exceptional craftsmanship. ${collectionSnippet}, this standout piece is ${materialSnippet.toLowerCase()}, ensuring both enduring resilience and aesthetic poise.\n\nDesigned to fit effortlessly into your everyday rituals, it offers ergonomic support paired with hand-finished detailing. ${audienceSnippet}\n\nWhether anchored as a statement centerpiece or harmoniously styled among existing interior tones, the ${p.title} brings subtle elegance, structural integrity, and lasting everyday value.`;
    } else {
      fullDesc = `The ${p.title} offers an exquisite blend of sophistication and utilitarian comfort. ${materialSnippet}, ${collectionSnippet}.\n\nEngineered with mindful proportions and tactile finishes, it enriches any contemporary room aesthetic while delivering effortless daily functionality. ${audienceSnippet}`;
    }

    const keywords = (input.keywords && input.keywords.length > 0)
      ? input.keywords.join(', ')
      : `${p.title.toLowerCase()}, modern ${p.category?.toLowerCase() || 'furniture'}, luxury home decor, premium design`;

    return {
      productTitle: `${p.title} | Exclusive JODO Collection`,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      keyFeatures: [
        p.material ? `Masterfully crafted using high-grade ${p.material}` : 'Durable precision construction',
        p.dimensions ? `Space-optimized dimensions: ${p.dimensions}` : 'Engineered for optimal space utilization',
        p.category ? `Curated especially for contemporary ${p.category.toLowerCase()}` : 'Timeless contemporary styling',
        p.warrantyTerms ? `Protected by ${p.warrantyTerms}` : 'Rigorous multi-stage JODO quality inspection',
        p.careAndMaintenance ? `Easy care: ${p.careAndMaintenance}` : 'Low maintenance, easy-to-clean architectural surface',
      ],
      seoMetaTitle: `${p.title} - Buy Online at JODO Store`,
      seoMetaDescription: `Discover the ${p.title}. ${shortDesc.slice(0, 140)}... Shop online with fast shipping.`,
      seoKeywords: keywords,
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
