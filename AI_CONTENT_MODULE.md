# AI Content Generation & CMS Publishing System — Architecture & Operational Guide

> **Module Status:** Production Ready  
> **Package Location:** `apps/admin/src/components/ai-content/`, `apps/admin/src/app/(dashboard)/ai-content/`, `apps/admin/src/stores/ai-content.ts`  
> **Primary Technology:** Next.js (App Router), Zustand (with `localStorage` persistence & version rollback), TypeScript, Tailwind CSS, Lucide Icons, Radix UI / shadcn.

---

## 1. Executive Summary & Vision

The **AI Content Generation & CMS Publishing System** accelerates merchandising and digital marketing workflows for high-SKU catalogues. Unlike generic text generators, this engine is **grounded in authentic CMS product metadata** (materials, dimensions, silhouettes, pricing, and factory craftsmanship notes) to eliminate AI hallucinations and ensure brand consistency.

### Core Pillars:
1. **Grounded In Authentic CMS Data**: Automatically ingests live attributes from the product catalogue (e.g., Carrara marble, solid teak, brass fluting, yarn counts).
2. **Channel-Specific Copy Adapters**: Formats tailored content for direct-to-consumer websites, Amazon (A+ & bullets), Flipkart, Myntra, and promotional marketing channels.
3. **Automated Quality & Fact-Check Scoring**: Evaluates content on a 0–100 scale measuring grammar, brand tone alignment, SEO keyword density, product accuracy, and duplicate risk.
4. **Enterprise Review & Publishing Governance**: Strict workflow permissions from `Draft` -> `Pending Review` -> `Changes Requested` -> `Approved` -> `Published to CMS`.
5. **Full Version History & Audit Trail**: Snapshotting with instant one-click rollbacks and reviewer annotations.

---

## 2. End-to-End Content Pipeline

```
[ CMS Product Catalogue / Campaign Brief ]
                   │
                   ▼
  [ Prompt Grounding & Tone Customization ]
  (Luxury, Premium, Minimal, Professional)
                   │
                   ▼
     [ Structured Generation Engine ]
  ├── Product Descriptions (Story + Tech Specs)
  ├── Marketplace Listing Copy (Amazon, Myntra)
  ├── Lookbook & Catalogue Narratives
  └── Omni-Channel Launch Campaigns (Email + Social)
                   │
                   ▼
   [ Automated Quality & Fact-Check Gate ]
  (Score: 0-100 | Grammar, Tone, Accuracy, SEO)
                   │
                   ▼
        [ Human Review & Approval ]
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
[ Changes Requested ]   [ Approved ]
        │                     │
        ▼                     ▼
[ Version Rollback ]    [ 1-Click Publish to CMS ]
```

---

## 3. Data Models & TypeScript Schemas

All types are strictly defined in `apps/admin/src/stores/ai-content.ts`:

### 3.1 Content Types & Statuses
```typescript
export type AiContentType =
  | 'product_description'
  | 'catalogue_content'
  | 'listing_copy'
  | 'campaign_content';

export type AiContentStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Changes Requested'
  | 'Approved'
  | 'Published'
  | 'Rejected';
```

### 3.2 Version Snapshotting (`AiContentVersion`)
Captures an immutable snapshot whenever content is generated or updated:
```typescript
export interface AiContentVersion {
  version: number;
  content: Record<string, any>;
  qualityScore?: number;
  modifiedBy: string;
  action: string;
  notes?: string;
  date: string;
}
```

### 3.3 Main Content Item (`AiContentItem`)
```typescript
export interface AiContentItem {
  id: string; // e.g., AIC-2026-001
  contentId?: string;
  contentType: AiContentType;
  productId?: string;
  productName: string;
  sku?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  campaignId?: string;
  campaignName?: string;
  title: string;
  generatedContent: Record<string, any>;
  editedContent: Record<string, any>;
  tone: string; // Luxury, Premium, Elegant, Professional, Friendly, Minimal
  length: 'Short' | 'Medium' | 'Detailed';
  channel?: string;
  targetAudience?: string;
  seoKeywords: string[];
  seoOptimized: boolean;
  qualityScore: number; // 0 - 100
  qualityChecks: {
    grammar: boolean;
    brandTone: boolean;
    seo: boolean;
    productAccuracy: boolean;
    duplicateRisk: 'Low' | 'Medium' | 'High';
    unsupportedClaimsCount: number;
  };
  status: AiContentStatus;
  version: number;
  createdBy: string;
  submittedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  reviewNotes?: string;
  versions: AiContentVersion[];
}
```

### 3.4 Activity Feed (`AiActivityItem`)
```typescript
export interface AiActivityItem {
  id: string;
  activity: string;
  user: string;
  date: string;
  time: string;
  type: 'generated' | 'edited' | 'reviewed' | 'approved' | 'published' | 'regenerated' | 'rejected';
}
```

---

## 4. Supported Content Generators

### 4.1 Product Descriptions (`/ai-content/product-descriptions`)
Designed for high-converting e-commerce product detail pages (PDP).
- **Grounded Inputs:** Product Name, Category, Material, Colour, Design Silhouette, Collection, Price, Key Features, Target Demographic.
- **Tone Profiles:** `Luxury` (heritage, artisan language), `Minimal` (Scandi, understated), `Friendly` (warm, accessible), `Professional` (architectural, material specs).
- **Structured Outputs:**
  - `heroTagline`: 1-line catchy headline.
  - `story`: Engaging narrative highlighting craft and lifestyle context.
  - `bullets`: 4–6 bullet highlights detailing dimensions and functional specs.
  - `materialsCare`: Wash/care instructions based on the authentic fabric/material.
  - `seoMetaTitle` & `seoMetaDescription`: Pre-formatted search snippets.

### 4.2 Marketplace Listing Copy (`/ai-content/listing-copy`)
Adapts a single product into platform-compliant formats:
- **Amazon:**
  - Optimized Title (under 200 characters, brand-first, key attributes included).
  - 5 Feature Bullets in standard capital-lead format (e.g., `PREMIUM MATERIAL: ...`).
  - Backend Search Terms (comma-separated high-volume keywords).
- **Flipkart & Myntra:** Highlights fashion-first styling advice, occasion wear, and size guidelines.
- **Web Store:** Full HTML/Markdown description with feature tabs.

### 4.3 Catalogue & Lookbook Content (`/ai-content/catalogue-content`)
Editorial-grade copy for print lookbooks, seasonal line sheets, and collection landing pages.
- **Outputs:**
  - Collection Concept Statement.
  - Artisan & Heritage Story.
  - Editorial Spread Captions.
  - Designer Notes & Styling Guide.

### 4.4 Omni-Channel Campaign Content (`/ai-content/campaign-content`)
Generates comprehensive promotional copy for seasonal sales and product launches:
- **Hero Banner Headlines & Subheaders**.
- **Email Marketing Pack** (Subject line variants, preview text, email body, CTA button text).
- **Social Media Pack** (Instagram captions, relevant hashtags, Pinterest description).
- **Performance Ads** (Google Search headline 1/2/3, description 1/2).
- **Conversational Commerce** (WhatsApp & SMS blast copies).

---

## 5. Automated Quality Scoring Engine

Every generated item is scored (0–100) and evaluated across 6 checkpoints:

| Checkpoint | Logic & Validation | Passing Criteria |
| :--- | :--- | :--- |
| **Grammar & Readability** | Analyzes readability index, punctuation, and active voice. | Flesch reading ease > 60 |
| **Brand Tone Adherence** | Checks vocabulary against luxury/brand guidelines. | Matches selected tone profile |
| **SEO Optimization** | Confirms primary & secondary keyword density in body and headings. | Target keywords present in first 100 words |
| **Product Accuracy** | Cross-references generated claims against CMS product specs. | Zero discrepancies with material or price |
| **Duplicate Risk** | Checks uniqueness against existing active catalogue items. | Low risk (< 15% phrase overlap) |
| **Unsupported Claims** | Flags unsubstantiated superlatives (e.g., "the world's only"). | 0 unsupported claims |

The score is visually rendered via `quality-score-badge.tsx`:
- `90 - 100`: **Excellent** (Green badge)
- `75 - 89`: **Good** (Blue badge)
- `60 - 74`: **Needs Review** (Amber badge)
- `< 60`: **Action Required** (Red badge)

---

## 6. Review, Approval & Publishing Governance

### Lifecycle States:
1. **Draft**: Content created by merchandiser or AI auto-generator. Editable at any time.
2. **Pending Review**: Submitter locks draft and routes it to Senior Copywriter / Merchandising Lead.
3. **Changes Requested**: Reviewer adds actionable inline notes. Content is returned to creator.
4. **Approved**: Content meets all quality standards and brand guidelines. Ready for CMS push.
5. **Published**: Synchronized directly into the live product catalogue / CMS datastore.

### Governance Modals:
- **`review-detail-modal.tsx`**: Side-by-side view comparing original CMS data, generated copy, and editor edits. Includes one-click **"Approve"**, **"Request Changes"**, and **"Publish"** actions.
- **`publish-confirmation-modal.tsx`**: Pre-flight checklist confirming target CMS fields before updating live storefront data.
- **`version-history-drawer.tsx`**: Chronological list of all edits with author, timestamp, and a **"Revert to this Version"** button.

---

## 7. UI Directory & Route Structure

Located under `apps/admin/src/app/(dashboard)/ai-content/`:

| Route | Primary View Component | Description |
| :--- | :--- | :--- |
| `/ai-content` | `apps/admin/src/app/(dashboard)/ai-content/page.tsx` | Overview dashboard with Content KPIs, Generation Activity Timeline, Quick Generator, and Status Filters. |
| `/ai-content/product-descriptions` | `product-descriptions/page.tsx` | CMS product selector, tone/length controls, live preview, and direct publish trigger. |
| `/ai-content/listing-copy` | `listing-copy/page.tsx` | Multi-channel marketplace tab (Amazon, Flipkart, Myntra, Web). |
| `/ai-content/catalogue-content` | `catalogue-content/page.tsx` | Lookbook editor, collection narrative generator, and artisan story builder. |
| `/ai-content/campaign-content` | `campaign-content/page.tsx` | Omni-channel launch suite generator (Email, Social, Ads, SMS). |
| `/ai-content/drafts` | `drafts/page.tsx` | Manage all working drafts with quality score indicators and bulk actions. |
| `/ai-content/review-approval` | `review-approval/page.tsx` | Merchandising approval queue with filter by status (`Pending Review`, `Changes Requested`). |
| `/ai-content/published` | `published/page.tsx` | Archive of live published content synced with the storefront. |

---

## 8. Standard Operating Procedures (SOPs)

### SOP 1: Generating a New Product Description
1. Navigate to `/ai-content/product-descriptions`.
2. Select a target product from the CMS selector (auto-populates title, category, material, and features).
3. Select desired **Tone** (`Luxury`, `Minimal`, etc.) and **Length** (`Detailed`).
4. Click **"Generate Description"**.
5. Inspect the generated story, bullet highlights, and SEO meta tags.
6. Make any inline adjustments in the **Content Editor Panel**.
7. Click **"Submit for Review"** or **"Publish to CMS"**.

### SOP 2: Reviewing & Publishing Content
1. Navigate to `/ai-content/review-approval`.
2. Click **"Review"** on any item with `Pending Review` status.
3. The **Review Detail Modal** opens with the Quality Score breakdown.
4. If adjustments are required: Enter notes in the review box and click **"Request Changes"**.
5. If copy is approved: Click **"Approve Content"**, then **"Publish to CMS"**.
6. The content status updates to `Published`, and an entry is logged in the AI Activity stream.
