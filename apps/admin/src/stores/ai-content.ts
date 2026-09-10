import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiContentType = 'product_description' | 'catalogue_content' | 'listing_copy' | 'campaign_content';
export type AiContentStatus = 'Draft' | 'Pending Review' | 'Changes Requested' | 'Approved' | 'Published' | 'Rejected';

export interface AiContentVersion {
  version: number;
  content: Record<string, any>;
  qualityScore?: number;
  modifiedBy: string;
  action: string;
  notes?: string;
  date: string;
}

export interface AiContentItem {
  id: string; // e.g. AIC-2026-001
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
  tone: string;
  length: 'Short' | 'Medium' | 'Detailed';
  channel?: string;
  targetAudience?: string;
  seoKeywords: string[];
  seoOptimized: boolean;
  qualityScore: number;
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

export interface AiActivityItem {
  id: string;
  activity: string;
  user: string;
  date: string;
  time: string;
  type: 'generated' | 'edited' | 'reviewed' | 'approved' | 'published' | 'regenerated' | 'rejected';
}

interface AiContentState {
  items: AiContentItem[];
  activities: AiActivityItem[];
  selectedItemId: string | null;
  activeFilterType: string;
  activeFilterStatus: string;
  searchQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilterType: (type: string) => void;
  setActiveFilterStatus: (status: string) => void;
  setSelectedItemId: (id: string | null) => void;

  generateContent: (input: {
    contentType: AiContentType;
    product?: any;
    campaign?: any;
    channel?: string;
    tone?: string;
    length?: 'Short' | 'Medium' | 'Detailed';
    seoOptimized?: boolean;
    keywords?: string[];
    targetAudience?: string;
  }) => AiContentItem;

  saveDraft: (id: string, editedContent: Record<string, any>) => void;
  submitForReview: (id: string, submittedBy?: string) => void;
  approveContent: (id: string, reviewer?: string) => void;
  rejectContent: (id: string, reason?: string) => void;
  requestChanges: (id: string, feedback: string) => void;
  publishToCms: (id: string, publishedBy?: string) => Promise<{ success: boolean; message: string }>;
  regenerateContent: (id: string, instruction: string) => void;
  deleteItem: (id: string) => void;

  // KPI Getters
  getKpis: () => {
    totalGenerated: number;
    drafts: number;
    pendingReview: number;
    approved: number;
    published: number;
  };
}

const INITIAL_ITEMS: AiContentItem[] = [
  {
    id: 'AIC-2026-001',
    contentType: 'product_description',
    productName: 'Aurelia Minimalist Teak Armchair',
    sku: 'JD-CHR-001',
    category: 'Living Room',
    price: 24999,
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
    title: 'Aurelia Minimalist Teak Armchair | Exclusive JODO Collection',
    tone: 'Luxury',
    length: 'Medium',
    channel: 'Website',
    targetAudience: 'Discerning homeowners seeking timeless luxury',
    seoKeywords: ['teak armchair', 'scandinavian living room', 'luxury handcrafted chair'],
    seoOptimized: true,
    qualityScore: 94,
    qualityChecks: {
      grammar: true,
      brandTone: true,
      seo: true,
      productAccuracy: true,
      duplicateRisk: 'Low',
      unsupportedClaimsCount: 0,
    },
    status: 'Approved',
    version: 3,
    createdBy: 'Priya Sharma',
    submittedBy: 'Priya Sharma',
    approvedBy: 'Kabir Mehta (Lead Editor)',
    submittedAt: '2026-09-08 14:30',
    approvedAt: '2026-09-09 10:15',
    createdAt: '2026-09-08 11:00',
    updatedAt: '2026-09-09 10:15',
    generatedContent: {
      productTitle: 'Aurelia Minimalist Teak Armchair | Exclusive JODO Collection',
      shortDescription: 'The Aurelia Armchair embodies Scandinavian serenity, crafted from certified solid Burma teakwood and upholstered in breathable textured boucle.',
      fullDescription: 'The Aurelia Minimalist Teak Armchair offers an exquisite blend of architectural poise and ergonomic comfort. Meticulously handcrafted from sustainably harvested Burma teakwood, it pairs a sculptured open-frame silhouette with high-density foam cushioning upholstered in textured boucle.\n\nEngineered with mindful proportions and hand-rubbed organic oil finishes, it enriches modern living rooms while enduring everyday use with heirloom resilience.',
      keyFeatures: [
        'Frame crafted from kiln-dried solid Burma teakwood',
        'Textured, stain-resistant premium boucle upholstery',
        'Ergonomically contoured armrests with seamless finger-joint joinery',
        'Multi-density foam core with fiber-wrap cushioning for sink-in relaxation',
        'Protected by 5-Year JODO Structural Warranty',
      ],
      seoMetaTitle: 'Aurelia Solid Teak Armchair - Premium Living Room Furniture | JODO',
      seoMetaDescription: 'Discover the Aurelia Teak Armchair. Handcrafted solid wood silhouette, breathable boucle upholstery, and timeless Scandinavian form. Shop with complimentary delivery.',
      seoKeywords: 'teak armchair, scandinavian living room, luxury handcrafted chair, boucle accent chair',
    },
    editedContent: {
      productTitle: 'Aurelia Minimalist Teak Armchair | Exclusive JODO Collection',
      shortDescription: 'The Aurelia Armchair embodies Scandinavian serenity, crafted from certified solid Burma teakwood and upholstered in breathable textured boucle.',
      fullDescription: 'The Aurelia Minimalist Teak Armchair offers an exquisite blend of architectural poise and ergonomic comfort. Meticulously handcrafted from sustainably harvested Burma teakwood, it pairs a sculptured open-frame silhouette with high-density foam cushioning upholstered in textured boucle.\n\nEngineered with mindful proportions and hand-rubbed organic oil finishes, it enriches modern living rooms while enduring everyday use with heirloom resilience.',
      keyFeatures: [
        'Frame crafted from kiln-dried solid Burma teakwood',
        'Textured, stain-resistant premium boucle upholstery',
        'Ergonomically contoured armrests with seamless finger-joint joinery',
        'Multi-density foam core with fiber-wrap cushioning for sink-in relaxation',
        'Protected by 5-Year JODO Structural Warranty',
      ],
      seoMetaTitle: 'Aurelia Solid Teak Armchair - Premium Living Room Furniture | JODO',
      seoMetaDescription: 'Discover the Aurelia Teak Armchair. Handcrafted solid wood silhouette, breathable boucle upholstery, and timeless Scandinavian form. Shop with complimentary delivery.',
      seoKeywords: 'teak armchair, scandinavian living room, luxury handcrafted chair, boucle accent chair',
    },
    versions: [
      {
        version: 1,
        content: { productTitle: 'Aurelia Teak Armchair' },
        qualityScore: 90,
        modifiedBy: 'AI Generator',
        action: 'AI Generated Draft',
        date: '2026-09-08 11:00',
      },
      {
        version: 2,
        content: { productTitle: 'Aurelia Minimalist Teak Armchair | Exclusive JODO Collection' },
        qualityScore: 94,
        modifiedBy: 'Priya Sharma',
        action: 'Edited by Admin (Refined SEO & Boucle Details)',
        date: '2026-09-08 14:15',
      },
      {
        version: 3,
        content: { productTitle: 'Aurelia Minimalist Teak Armchair | Exclusive JODO Collection' },
        qualityScore: 94,
        modifiedBy: 'Kabir Mehta',
        action: 'Approved by Lead Editor',
        date: '2026-09-09 10:15',
      },
    ],
  },
  {
    id: 'AIC-2026-002',
    contentType: 'listing_copy',
    productName: 'Nordic Oak Floating Bedframe',
    sku: 'JD-BED-004',
    category: 'Bedroom',
    price: 48999,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
    title: 'Nordic Oak Floating Platform Bedframe - Amazon Optimized',
    tone: 'Professional',
    length: 'Detailed',
    channel: 'Amazon',
    targetAudience: 'Urban homeowners upgrading to Japanese-Scandinavian minimalist master bedrooms',
    seoKeywords: ['floating platform bed', 'solid oak bedframe', 'king size platform bed', 'japanese minimalist bed'],
    seoOptimized: true,
    qualityScore: 96,
    qualityChecks: {
      grammar: true,
      brandTone: true,
      seo: true,
      productAccuracy: true,
      duplicateRisk: 'Low',
      unsupportedClaimsCount: 0,
    },
    status: 'Pending Review',
    version: 1,
    createdBy: 'Sneha Patel',
    submittedBy: 'Sneha Patel',
    submittedAt: '2026-09-09 09:40',
    createdAt: '2026-09-09 09:20',
    updatedAt: '2026-09-09 09:40',
    generatedContent: {
      channel: 'Amazon',
      productListingTitle: 'JODO Nordic Oak Floating Platform Bed Frame with Inset Concealed Legs - Solid Oak Finish, Zero-Squeak Heavy Duty Slat Base (King / Queen)',
      shortDescription: 'Elevate your bedroom with the JODO Nordic Floating Bedframe, crafted from American White Oak with zero-squeak interlocking joinery.',
      detailedDescription: 'TRANSFORM YOUR BEDROOM INTO A TRANQUIL RETREAT: The JODO Nordic Floating Bed features a cantilevered base that creates an ethereal floating aesthetic while maximizing bedroom floor openness.\n\nENGINEERED TO PERFECTION: Constructed with heavy-gauge internal steel fasteners and solid kiln-dried oak veneered core. Supports up to 450 kg distributed weight without center leg obstruction.\n\nNOISELESS SLAT ARCHITECTURE: Includes 14 individual posture-sprung birch slats with silicone noise-dampening dampeners ensuring absolute quiet throughout the night.',
      bulletPoints: [
        'ETHEREAL FLOATING DESIGN: Inset base hidden 12 inches beneath frame creates a serene suspended visual illusion.',
        'SOLID OAK CRAFTSMANSHIP: Hand-selected American White Oak finished in ultra-matte child-safe organic polyurethane.',
        'ZERO-SQUEAK GUARANTEE: Precision CNC acoustic damping channels eliminate wood-on-wood squeaks and motion transfer.',
        'EASY 30-MINUTE ASSEMBLY: Smart modular slots allow 2-person assembly with single included Allen wrench.',
        'DIRECT FROM BRAND: 10-Year Frame Structural Warranty and doorstep delivery with white-glove setup option.',
      ],
      keyFeatures: [
        'Cantilevered 12-inch recessed pedestal base',
        'Solid American White Oak exterior',
        '450 kg load capacity with reinforced steel spine',
        'Noise-dampening acoustic birch slat array',
      ],
      searchKeywords: 'floating bed frame, solid oak bed, scandinavian platform bed, noiseless king bedframe, modern low profile bed',
      metaTitle: 'Buy JODO Nordic Floating Oak Bed Online | Amazon India',
      metaDescription: 'Shop JODO Nordic Floating Oak Bed Frame. American white oak, zero-squeak slats, 450kg capacity. Free shipping & 10-year warranty.',
    },
    editedContent: {
      channel: 'Amazon',
      productListingTitle: 'JODO Nordic Oak Floating Platform Bed Frame with Inset Concealed Legs - Solid Oak Finish, Zero-Squeak Heavy Duty Slat Base (King / Queen)',
      shortDescription: 'Elevate your bedroom with the JODO Nordic Floating Bedframe, crafted from American White Oak with zero-squeak interlocking joinery.',
      detailedDescription: 'TRANSFORM YOUR BEDROOM INTO A TRANQUIL RETREAT: The JODO Nordic Floating Bed features a cantilevered base that creates an ethereal floating aesthetic while maximizing bedroom floor openness.\n\nENGINEERED TO PERFECTION: Constructed with heavy-gauge internal steel fasteners and solid kiln-dried oak veneered core. Supports up to 450 kg distributed weight without center leg obstruction.\n\nNOISELESS SLAT ARCHITECTURE: Includes 14 individual posture-sprung birch slats with silicone noise-dampening dampeners ensuring absolute quiet throughout the night.',
      bulletPoints: [
        'ETHEREAL FLOATING DESIGN: Inset base hidden 12 inches beneath frame creates a serene suspended visual illusion.',
        'SOLID OAK CRAFTSMANSHIP: Hand-selected American White Oak finished in ultra-matte child-safe organic polyurethane.',
        'ZERO-SQUEAK GUARANTEE: Precision CNC acoustic damping channels eliminate wood-on-wood squeaks and motion transfer.',
        'EASY 30-MINUTE ASSEMBLY: Smart modular slots allow 2-person assembly with single included Allen wrench.',
        'DIRECT FROM BRAND: 10-Year Frame Structural Warranty and doorstep delivery with white-glove setup option.',
      ],
      keyFeatures: [
        'Cantilevered 12-inch recessed pedestal base',
        'Solid American White Oak exterior',
        '450 kg load capacity with reinforced steel spine',
        'Noise-dampening acoustic birch slat array',
      ],
      searchKeywords: 'floating bed frame, solid oak bed, scandinavian platform bed, noiseless king bedframe, modern low profile bed',
      metaTitle: 'Buy JODO Nordic Floating Oak Bed Online | Amazon India',
      metaDescription: 'Shop JODO Nordic Floating Oak Bed Frame. American white oak, zero-squeak slats, 450kg capacity. Free shipping & 10-year warranty.',
    },
    versions: [
      {
        version: 1,
        content: { productListingTitle: 'JODO Nordic Oak Floating Platform Bed' },
        qualityScore: 96,
        modifiedBy: 'AI Generator',
        action: 'AI Generated Draft',
        date: '2026-09-09 09:20',
      },
    ],
  },
  {
    id: 'AIC-2026-003',
    contentType: 'campaign_content',
    productName: 'Festive Home Luxury Curation',
    campaignName: 'Diwali Festive Curation 2026',
    title: 'Diwali Festive Curation 2026 (Multi-Channel Copy)',
    tone: 'Luxury',
    length: 'Medium',
    channel: 'All Channels (Email, WhatsApp, IG, Web, SMS)',
    targetAudience: 'High net worth patrons and repeat luxury design buyers',
    seoKeywords: ['diwali home makeover', 'luxury festive decor', 'handcrafted designer furniture'],
    seoOptimized: true,
    qualityScore: 92,
    qualityChecks: {
      grammar: true,
      brandTone: true,
      seo: true,
      productAccuracy: true,
      duplicateRisk: 'Low',
      unsupportedClaimsCount: 0,
    },
    status: 'Changes Requested',
    reviewNotes: 'Tone in WhatsApp copy is slightly too formal; please make WhatsApp copy friendlier and emphasize complimentary festive styling consultation.',
    version: 2,
    createdBy: 'Rajesh Verma',
    submittedBy: 'Rajesh Verma',
    reviewedBy: 'Kabir Mehta',
    createdAt: '2026-09-07 16:20',
    updatedAt: '2026-09-08 17:00',
    generatedContent: {
      campaignName: 'Diwali Festive Curation 2026',
      campaignType: 'Festival',
      offer: 'Complimentary ₹15,000 Styling Voucher + Flat 15% Festive Privilege',
      email: {
        subject: '✨ An Ode to Light & Form: The JODO Diwali Festive Curation',
        preheader: 'Curated architectural pieces for illuminated celebrations. Reserve your festive delivery slots.',
        headline: 'Welcome Prosperity with Timeless Architectural Living',
        body: 'Dear Patron,\n\nAs the festival of illumination approaches, home becomes the sacred canvas for warmth, celebration, and cherished hospitality.\n\nIntroducing the JODO Diwali Curation — a bespoke portfolio of solid teak dining ensembles, sculptured accent seating, and ambient brass illumination.\n\nEnjoy an exclusive 15% Festive Privilege and a complimentary consultation with our Senior Interior Stylists for homes placed this week.',
        cta: 'Explore The Festive Atelier',
      },
      whatsapp: {
        message: 'Shubh Deepavali from JODO! 🪔✨\n\nElevate your celebrations with our handcrafted festive collection. From artisanal solid wood dining tables to statement lounge armchairs, each piece brings warmth and heirloom grace.\n\n🎁 Exclusive Festive Benefit: Flat 15% Privilege + Complimentary Interior Styling Consultation.\n\nTap below to explore your private showcase:',
        offer: 'Flat 15% Off + Styling Consult',
        cta: 'View Private Showcase',
      },
      instagram: {
        caption: 'When festive light reflects upon hand-rubbed Burma teak and brushed brass. 🪔✨\n\nThe JODO Diwali Festive Curation is now open for private viewings and nationwide white-glove delivery.\n\nDiscover pieces designed to hold generations of laughter and golden memories. Tap link in bio to experience the collection.\n\n#JODOLuxury #Diwali2026 #ModernHeirloom #FestiveHomes #ArchitecturalLiving #IndianInteriors',
        cta: 'Experience Collection in Bio',
        hashtags: ['#JODOLuxury', '#Diwali2026', '#FestiveLiving', '#TeakFurniture', '#DesignerHomes'],
      },
      website: {
        campaignHeadline: 'The Festive Atelier: Illuminating Modern Sanctuary',
        subheading: 'Heirloom craftsmanship for life’s most luminous gatherings. Enjoy 15% Festive Privilege.',
        bannerCopy: 'Curated dining, sculptural seating, and ambient lighting engineered for festive warmth and lasting memories.',
        cta: 'Shop Festive Atelier',
      },
      sms: {
        text: 'JODO Diwali Privilege: Elevate your home celebrations with 15% festive savings + complimentary styling advice. Reserve before delivery cut-offs: https://jodo.store/diwali',
      },
    },
    editedContent: {
      campaignName: 'Diwali Festive Curation 2026',
      campaignType: 'Festival',
      offer: 'Complimentary ₹15,000 Styling Voucher + Flat 15% Festive Privilege',
      email: {
        subject: '✨ An Ode to Light & Form: The JODO Diwali Festive Curation',
        preheader: 'Curated architectural pieces for illuminated celebrations. Reserve your festive delivery slots.',
        headline: 'Welcome Prosperity with Timeless Architectural Living',
        body: 'Dear Patron,\n\nAs the festival of illumination approaches, home becomes the sacred canvas for warmth, celebration, and cherished hospitality.\n\nIntroducing the JODO Diwali Curation — a bespoke portfolio of solid teak dining ensembles, sculptured accent seating, and ambient brass illumination.\n\nEnjoy an exclusive 15% Festive Privilege and a complimentary consultation with our Senior Interior Stylists for homes placed this week.',
        cta: 'Explore The Festive Atelier',
      },
      whatsapp: {
        message: 'Shubh Deepavali from JODO! 🪔✨\n\nElevate your celebrations with our handcrafted festive collection. From artisanal solid wood dining tables to statement lounge armchairs, each piece brings warmth and heirloom grace.\n\n🎁 Exclusive Festive Benefit: Flat 15% Privilege + Complimentary Interior Styling Consultation.\n\nTap below to explore your private showcase:',
        offer: 'Flat 15% Off + Styling Consult',
        cta: 'View Private Showcase',
      },
      instagram: {
        caption: 'When festive light reflects upon hand-rubbed Burma teak and brushed brass. 🪔✨\n\nThe JODO Diwali Festive Curation is now open for private viewings and nationwide white-glove delivery.\n\nDiscover pieces designed to hold generations of laughter and golden memories. Tap link in bio to experience the collection.\n\n#JODOLuxury #Diwali2026 #ModernHeirloom #FestiveHomes #ArchitecturalLiving #IndianInteriors',
        cta: 'Experience Collection in Bio',
        hashtags: ['#JODOLuxury', '#Diwali2026', '#FestiveLiving', '#TeakFurniture', '#DesignerHomes'],
      },
      website: {
        campaignHeadline: 'The Festive Atelier: Illuminating Modern Sanctuary',
        subheading: 'Heirloom craftsmanship for life’s most luminous gatherings. Enjoy 15% Festive Privilege.',
        bannerCopy: 'Curated dining, sculptural seating, and ambient lighting engineered for festive warmth and lasting memories.',
        cta: 'Shop Festive Atelier',
      },
      sms: {
        text: 'JODO Diwali Privilege: Elevate your home celebrations with 15% festive savings + complimentary styling advice. Reserve before delivery cut-offs: https://jodo.store/diwali',
      },
    },
    versions: [
      {
        version: 1,
        content: { campaignName: 'Diwali Festive Curation 2026' },
        qualityScore: 92,
        modifiedBy: 'AI Generator',
        action: 'AI Generated Draft',
        date: '2026-09-07 16:20',
      },
      {
        version: 2,
        content: { campaignName: 'Diwali Festive Curation 2026' },
        qualityScore: 92,
        modifiedBy: 'Kabir Mehta',
        action: 'Changes Requested (Refine WhatsApp tone)',
        date: '2026-09-08 17:00',
      },
    ],
  },
  {
    id: 'AIC-2026-004',
    contentType: 'catalogue_content',
    productName: 'Solstice Marble & Brass Dining Table',
    sku: 'JD-DNG-012',
    category: 'Dining',
    price: 89999,
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
    title: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE',
    tone: 'Luxury',
    length: 'Detailed',
    channel: 'Catalogue',
    targetAudience: 'Architects, interior designers, and luxury homeowners',
    seoKeywords: ['marble dining table', 'brass dining base', 'luxury 8 seater table', 'italian carrara table'],
    seoOptimized: true,
    qualityScore: 98,
    qualityChecks: {
      grammar: true,
      brandTone: true,
      seo: true,
      productAccuracy: true,
      duplicateRisk: 'Low',
      unsupportedClaimsCount: 0,
    },
    status: 'Published',
    version: 4,
    createdBy: 'Admin',
    submittedBy: 'Admin',
    approvedBy: 'Kabir Mehta',
    publishedBy: 'Admin',
    submittedAt: '2026-09-06 10:00',
    approvedAt: '2026-09-06 15:30',
    publishedAt: '2026-09-07 09:00',
    createdAt: '2026-09-06 09:15',
    updatedAt: '2026-09-07 09:00',
    generatedContent: {
      catalogueTitle: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE',
      shortDescription: 'Monolithic Italian Carrara marble slab counterbalanced by hand-patinated brushed brass fluted pedestal columns.',
      detailedDescription: 'The Solstice Dining Table stands at the intersection of monumental sculpture and refined domestic utility. Each top is cut from a single 30mm slab of Italian Carrara marble, hand-honed to a tactile silk finish and sealed with oleophobic invisible protection.\n\nTwo fluted architectural pedestals in brushed architectural brass provide rock-solid poise without encroaching upon guest knee clearances. Accommodates 8 to 10 dinner guests comfortably.',
      collectionIntroduction: 'The Solstice Series explores heavy mineral earth and hand-finished metallics, evoking timeless Roman monumentalism in modern residences.',
      productHighlights: [
        'Single 30mm continuous Italian Carrara marble slab with bookmatched veining',
        'Cast brass fluted pedestals with hand-rubbed anti-tarnish protective lacquer',
        'Reinforced sub-plywood core preventing marble deflection and hairline thermal shock',
        'Comfortably seats 8–10 guests with unrestricted perimeter leg room',
      ],
      materialDetails: 'Italian Carrara Marble (30mm thickness), Heavy-Gauge Solid Brass Pedestals, Marine-Grade Structural Underlayment.',
      careInstructions: 'Clean with pH-neutral stone soap and damp microfibre cloth. Wipe wine, lemon, or oil spills immediately. Reseal marble annually with provided JODO Stone Sealant.',
      productSpecifications: [
        { key: 'Dimensions', value: '240 cm (L) x 105 cm (W) x 76 cm (H)' },
        { key: 'Weight', value: '185 kg' },
        { key: 'Seating Capacity', value: '8 to 10 Seats' },
        { key: 'Assembly', value: 'White-Glove 2-Person Assembly Required (Included)' },
        { key: 'Origin', value: 'Marble: Carrara, Italy | Craft: JODO Atelier, India' },
      ],
    },
    editedContent: {
      catalogueTitle: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE',
      shortDescription: 'Monolithic Italian Carrara marble slab counterbalanced by hand-patinated brushed brass fluted pedestal columns.',
      detailedDescription: 'The Solstice Dining Table stands at the intersection of monumental sculpture and refined domestic utility. Each top is cut from a single 30mm slab of Italian Carrara marble, hand-honed to a tactile silk finish and sealed with oleophobic invisible protection.\n\nTwo fluted architectural pedestals in brushed architectural brass provide rock-solid poise without encroaching upon guest knee clearances. Accommodates 8 to 10 dinner guests comfortably.',
      collectionIntroduction: 'The Solstice Series explores heavy mineral earth and hand-finished metallics, evoking timeless Roman monumentalism in modern residences.',
      productHighlights: [
        'Single 30mm continuous Italian Carrara marble slab with bookmatched veining',
        'Cast brass fluted pedestals with hand-rubbed anti-tarnish protective lacquer',
        'Reinforced sub-plywood core preventing marble deflection and hairline thermal shock',
        'Comfortably seats 8–10 guests with unrestricted perimeter leg room',
      ],
      materialDetails: 'Italian Carrara Marble (30mm thickness), Heavy-Gauge Solid Brass Pedestals, Marine-Grade Structural Underlayment.',
      careInstructions: 'Clean with pH-neutral stone soap and damp microfibre cloth. Wipe wine, lemon, or oil spills immediately. Reseal marble annually with provided JODO Stone Sealant.',
      productSpecifications: [
        { key: 'Dimensions', value: '240 cm (L) x 105 cm (W) x 76 cm (H)' },
        { key: 'Weight', value: '185 kg' },
        { key: 'Seating Capacity', value: '8 to 10 Seats' },
        { key: 'Assembly', value: 'White-Glove 2-Person Assembly Required (Included)' },
        { key: 'Origin', value: 'Marble: Carrara, Italy | Craft: JODO Atelier, India' },
      ],
    },
    versions: [
      {
        version: 1,
        content: { catalogueTitle: 'Solstice Dining Table' },
        qualityScore: 95,
        modifiedBy: 'AI Generator',
        action: 'AI Generated Draft',
        date: '2026-09-06 09:15',
      },
      {
        version: 2,
        content: { catalogueTitle: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE' },
        qualityScore: 98,
        modifiedBy: 'Admin',
        action: 'Edited by Admin (Added Italian Carrara sourcing notes)',
        date: '2026-09-06 09:50',
      },
      {
        version: 3,
        content: { catalogueTitle: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE' },
        qualityScore: 98,
        modifiedBy: 'Kabir Mehta',
        action: 'Approved by Manager',
        date: '2026-09-06 15:30',
      },
      {
        version: 4,
        content: { catalogueTitle: 'JODO ARCHIVE: SOLSTICE MARBLE & BRASS DINING TABLE' },
        qualityScore: 98,
        modifiedBy: 'Admin',
        action: 'Published to CMS',
        date: '2026-09-07 09:00',
      },
    ],
  },
  {
    id: 'AIC-2026-005',
    contentType: 'product_description',
    productName: 'Komorebi Hand-Woven Cane Credenza',
    sku: 'JD-STG-008',
    category: 'Storage',
    price: 38500,
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    title: 'Komorebi Hand-Woven Cane Credenza | JODO Storage',
    tone: 'Minimal',
    length: 'Medium',
    channel: 'Website',
    targetAudience: 'Minimalist living rooms and media spaces',
    seoKeywords: ['cane credenza', 'rattan sideboard', 'teak media console', 'boho minimalist storage'],
    seoOptimized: true,
    qualityScore: 95,
    qualityChecks: {
      grammar: true,
      brandTone: true,
      seo: true,
      productAccuracy: true,
      duplicateRisk: 'Low',
      unsupportedClaimsCount: 0,
    },
    status: 'Draft',
    version: 1,
    createdBy: 'Priya Sharma',
    createdAt: '2026-09-09 11:20',
    updatedAt: '2026-09-09 11:20',
    generatedContent: {
      productTitle: 'Komorebi Hand-Woven Cane Credenza | JODO Storage',
      shortDescription: 'The Komorebi Credenza harmonizes natural cane webbing with solid ashwood framework, offering breathable storage and organic warmth.',
      fullDescription: 'Named after the Japanese term for sunlight filtering through trees, the Komorebi Credenza brings organic tranquility to modern interiors. Hand-woven hexagonal cane panels provide ventilation for audio-visual media components while keeping clutter gracefully concealed.\n\nCrafted with solid kiln-dried ashwood and fitted with soft-close German concealed hinges and discreet cable management grommets.',
      keyFeatures: [
        'Natural hexagonal cane webbing hand-woven by master artisans',
        'Solid sustainable Ashwood framework with chamfered edge details',
        'Soft-close concealed German hinges and magnetic catches',
        'Integrated rear cable management ports for discreet media connectivity',
      ],
      seoMetaTitle: 'Komorebi Cane & Ashwood Credenza - Modern Media Console | JODO',
      seoMetaDescription: 'Shop the Komorebi Hand-Woven Cane Credenza. Natural rattan webbing, solid ashwood, and soft-close storage. Order online today.',
      seoKeywords: 'cane credenza, rattan sideboard, teak media console, boho minimalist storage',
    },
    editedContent: {
      productTitle: 'Komorebi Hand-Woven Cane Credenza | JODO Storage',
      shortDescription: 'The Komorebi Credenza harmonizes natural cane webbing with solid ashwood framework, offering breathable storage and organic warmth.',
      fullDescription: 'Named after the Japanese term for sunlight filtering through trees, the Komorebi Credenza brings organic tranquility to modern interiors. Hand-woven hexagonal cane panels provide ventilation for audio-visual media components while keeping clutter gracefully concealed.\n\nCrafted with solid kiln-dried ashwood and fitted with soft-close German concealed hinges and discreet cable management grommets.',
      keyFeatures: [
        'Natural hexagonal cane webbing hand-woven by master artisans',
        'Solid sustainable Ashwood framework with chamfered edge details',
        'Soft-close concealed German hinges and magnetic catches',
        'Integrated rear cable management ports for discreet media connectivity',
      ],
      seoMetaTitle: 'Komorebi Cane & Ashwood Credenza - Modern Media Console | JODO',
      seoMetaDescription: 'Shop the Komorebi Hand-Woven Cane Credenza. Natural rattan webbing, solid ashwood, and soft-close storage. Order online today.',
      seoKeywords: 'cane credenza, rattan sideboard, teak media console, boho minimalist storage',
    },
    versions: [
      {
        version: 1,
        content: { productTitle: 'Komorebi Hand-Woven Cane Credenza | JODO Storage' },
        qualityScore: 95,
        modifiedBy: 'AI Generator',
        action: 'AI Generated Draft',
        date: '2026-09-09 11:20',
      },
    ],
  },
];

const INITIAL_ACTIVITIES: AiActivityItem[] = [
  {
    id: 'ACT-001',
    activity: 'Product description generated for Aurelia Minimalist Teak Armchair',
    user: 'Priya Sharma',
    date: 'Today',
    time: '11:20 AM',
    type: 'generated',
  },
  {
    id: 'ACT-002',
    activity: 'Amazon listing copy submitted for review (Nordic Oak Floating Bedframe)',
    user: 'Sneha Patel',
    date: 'Today',
    time: '09:40 AM',
    type: 'reviewed',
  },
  {
    id: 'ACT-003',
    activity: 'Diwali Festive Curation 2026 changes requested by Lead Editor',
    user: 'Kabir Mehta',
    date: 'Yesterday',
    time: '05:00 PM',
    type: 'reviewed',
  },
  {
    id: 'ACT-004',
    activity: 'Aurelia Minimalist Teak Armchair approved by Lead Editor',
    user: 'Kabir Mehta',
    date: 'Yesterday',
    time: '10:15 AM',
    type: 'approved',
  },
  {
    id: 'ACT-005',
    activity: 'Solstice Marble & Brass Dining Table published to live CMS',
    user: 'Admin',
    date: '2 days ago',
    time: '09:00 AM',
    type: 'published',
  },
];

export const useAiContentStore = create<AiContentState>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,
      activities: INITIAL_ACTIVITIES,
      selectedItemId: null,
      activeFilterType: 'all',
      activeFilterStatus: 'all',
      searchQuery: '',

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveFilterType: (type) => set({ activeFilterType: type }),
      setActiveFilterStatus: (status) => set({ activeFilterStatus: status }),
      setSelectedItemId: (id) => set({ selectedItemId: id }),

      getKpis: () => {
        const items = get().items;
        return {
          totalGenerated: 248 + (items.length - INITIAL_ITEMS.length),
          drafts: 32 + (items.filter((i) => i.status === 'Draft').length - 1),
          pendingReview: 18 + (items.filter((i) => i.status === 'Pending Review').length - 1),
          approved: 41 + (items.filter((i) => i.status === 'Approved').length - 1),
          published: 157 + (items.filter((i) => i.status === 'Published').length - 1),
        };
      },

      generateContent: (input) => {
        const id = `AIC-2026-${String(get().items.length + 101).padStart(3, '0')}`;
        const p = input.product || {};
        const title = p.title || input.campaign?.name || 'New AI Content Draft';
        const tone = input.tone || 'Luxury';
        const length = input.length || 'Medium';

        // High quality generation subroutine
        let generated: Record<string, any> = {};
        if (input.contentType === 'product_description') {
          const short = `${title} is meticulously crafted${p.material ? ` from authentic ${p.material}` : ''}, delivering unmatched comfort, durability, and timeless silhouette.`;
          generated = {
            productTitle: `${title} | Exclusive JODO Collection`,
            shortDescription: short,
            fullDescription: `${title} offers an exquisite blend of sophistication and utilitarian comfort. Handcrafted${p.material ? ` using ${p.material}` : ''}, it enriches any contemporary room aesthetic while delivering effortless daily functionality.\n\nEvery contour is engineered with precision to provide optimum ergonomic balance while elevating the visual ambiance of your home.`,
            keyFeatures: [
              p.material ? `Masterfully crafted using high-grade ${p.material}` : 'Durable structural joinery',
              p.dimensions ? `Space-optimized dimensions: ${p.dimensions}` : 'Engineered for modern space flow',
              'Tested for decades of residential and hospitality durability',
              'Finished in child-safe, eco-friendly organic sealants',
            ],
            seoMetaTitle: `${title} - Buy Online at JODO`,
            seoMetaDescription: `Discover the ${title}. ${short.slice(0, 140)}... Shop online with fast shipping.`,
            seoKeywords: input.keywords?.join(', ') || `${title.toLowerCase()}, modern furniture, luxury living, jodo design`,
          };
        } else if (input.contentType === 'catalogue_content') {
          generated = {
            catalogueTitle: `JODO ARCHIVE: ${title.toUpperCase()}`,
            shortDescription: `${title} embodies architectural grace and pure artisanal mastery.`,
            detailedDescription: `Part of our permanent catalogue curation, the ${title} balances generous proportions with geometric purity. Built for discerning collectors who appreciate fine details.\n\nHand-finished with low-VOC natural oils and inspected against JODO's 14-point benchmark.`,
            collectionIntroduction: 'The Master Collection marries ergonomic mastery with architectural simplicity.',
            productHighlights: [
              'Continuous grain alignment across key structural members',
              p.material ? `Certified sustainable ${p.material}` : 'Premium grade materials',
              'Seamless precision joinery',
              'Heirloom quality assurance',
            ],
            materialDetails: p.material ? `Primary Material: ${p.material}` : 'Premium architectural materials',
            careInstructions: 'Wipe with soft microfibre cloth. Avoid direct harsh sunlight and abrasive cleaners.',
            productSpecifications: [
              { key: 'Category', value: p.category || 'Furniture' },
              { key: 'SKU', value: p.sku || 'JD-CAT-09' },
              { key: 'Warranty', value: '5-Year Structural Guarantee' },
            ],
          };
        } else if (input.contentType === 'listing_copy') {
          const channel = input.channel || 'Amazon';
          generated = {
            channel,
            productListingTitle: `${title} (${p.category || 'Home'}, ${p.material || 'Premium Finish'}) - ${channel} Optimized`,
            shortDescription: `${title} offers sleek modern comfort and long-lasting durability.`,
            detailedDescription: `Elevate your space with the ${title}. Designed with modern sensibilities and engineered for daily comfort, this piece combines structural stability with refined aesthetics.\n\nCrafted with premium materials and rigorous standards, it brings lasting value to your home.`,
            bulletPoints: [
              `PREMIUM BUILD & FINISH: Expertly crafted from genuine ${p.material || 'materials'} for resilient daily usage.`,
              'MODERN ERGONOMIC PROFILE: Thoughtfully sized to enhance room flow while maximizing comfort.',
              'VERSATILE AESTHETIC: Complements modern, Scandinavian, and minimalist decors effortlessly.',
              'SAFE & RELIABLE: Undergoes rigorous load-bearing and scratch-resistance testing before dispatch.',
              'DIRECT FROM BRAND: Backed by full JODO manufacturer warranty and prompt customer care.',
            ],
            keyFeatures: [
              p.material ? `Material: ${p.material}` : 'Durable build',
              'Scratch & stain resistant finish',
              'Direct from brand quality guarantee',
            ],
            searchKeywords: input.keywords?.join(', ') || `${title}, modern home, designer decor, luxury online`,
            metaTitle: `Buy ${title} Online | Best Price on ${channel}`,
            metaDescription: `Shop the ${title} on ${channel}. High-quality materials, stylish design, and top ratings.`,
          };
        } else {
          // Campaign Content
          const c = input.campaign || { name: title, offer: '15% Off' };
          generated = {
            campaignName: c.name || title,
            campaignType: c.type || 'Seasonal Campaign',
            offer: c.offer || 'Flat 15% Festive Privilege',
            email: {
              subject: `✨ Exclusive: ${c.name || title}`,
              preheader: 'Discover our newest curation crafted for elevated living.',
              headline: `Introducing ${c.name || title}`,
              body: `Dear Connoisseur,\n\nWe are delighted to present our latest curation of architectural essentials.\n\nEnjoy an exclusive ${c.offer || '15% privilege'} across selected collections.`,
              cta: 'Explore Collection Now',
            },
            whatsapp: {
              message: `Hello from JODO! ✨\n\nCelebrate refined living with the *${c.name || title}*.\n\n🎉 Special Privilege: *${c.offer || 'Flat 15% Off'}*\n\nTap below to explore:`,
              offer: c.offer || '15% Off',
              cta: 'Browse on WhatsApp',
            },
            instagram: {
              caption: `Quiet luxury, timeless silhouettes. Introducing ${c.name || title}. ✨\n\nTap link in bio to explore the drop.\n\n#JODOHome #ModernLiving #LuxuryLiving`,
              cta: 'Shop Link in Bio',
              hashtags: ['#JODOHome', '#ModernFurniture', '#InteriorStyle', '#DesignInspiration'],
            },
            website: {
              campaignHeadline: c.name || title,
              subheading: `Thoughtful design for timeless homes. ${c.offer || '15% Off'}.`,
              bannerCopy: 'Curated collections engineered with artisanal integrity. Elevate your everyday rituals.',
              cta: 'Shop The Campaign',
            },
            sms: {
              text: `JODO VIP: Discover ${c.name || title}! Enjoy ${c.offer || '15% off'} on our finest pieces today: https://jodo.store/exclusive`,
            },
          };
        }

        const newItem: AiContentItem = {
          id,
          contentType: input.contentType,
          productId: p.id,
          productName: title,
          sku: p.sku || 'JD-NEW',
          category: p.category || 'General',
          price: p.price || 19999,
          imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
          campaignName: input.campaign?.name,
          title: generated.productTitle || generated.catalogueTitle || generated.productListingTitle || title,
          generatedContent: generated,
          editedContent: generated,
          tone,
          length,
          channel: input.channel || 'Website',
          targetAudience: input.targetAudience,
          seoKeywords: input.keywords || [],
          seoOptimized: input.seoOptimized ?? true,
          qualityScore: 94,
          qualityChecks: {
            grammar: true,
            brandTone: true,
            seo: true,
            productAccuracy: true,
            duplicateRisk: 'Low',
            unsupportedClaimsCount: 0,
          },
          status: 'Draft',
          version: 1,
          createdBy: 'Admin',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          versions: [
            {
              version: 1,
              content: generated,
              qualityScore: 94,
              modifiedBy: 'AI Generator',
              action: 'AI Generated Draft',
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            },
          ],
        };

        const newActivity: AiActivityItem = {
          id: `ACT-${Date.now()}`,
          activity: `${input.contentType.replace('_', ' ')} generated for ${title}`,
          user: 'Admin',
          date: 'Just now',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'generated',
        };

        set((state) => ({
          items: [newItem, ...state.items],
          activities: [newActivity, ...state.activities],
          selectedItemId: newItem.id,
        }));

        // Fire-and-forget sync to backend API if running
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          fetch(`${API_BASE}/api/ai-content/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          }).catch(() => {});
        } catch {}

        return newItem;
      },

      saveDraft: (id, editedContent) => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              const newVersion = item.version + 1;
              const versionObj: AiContentVersion = {
                version: newVersion,
                content: editedContent,
                qualityScore: item.qualityScore,
                modifiedBy: 'Admin',
                action: 'Edited by Admin',
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
              return {
                ...item,
                editedContent,
                version: newVersion,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                versions: [versionObj, ...item.versions],
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Draft edited by Admin for ${id}`,
            user: 'Admin',
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'edited',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editedContent }),
        }).catch(() => {});
      },

      submitForReview: (id, submittedBy = 'Admin') => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              const newVersion = item.version + 1;
              const versionObj: AiContentVersion = {
                version: newVersion,
                content: item.editedContent,
                qualityScore: item.qualityScore,
                modifiedBy: submittedBy,
                action: 'Submitted for Review',
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
              return {
                ...item,
                status: 'Pending Review' as AiContentStatus,
                submittedBy,
                submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                version: newVersion,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                versions: [versionObj, ...item.versions],
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Content submitted for review by ${submittedBy}`,
            user: submittedBy,
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'reviewed',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}/submit-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submittedBy }),
        }).catch(() => {});
      },

      approveContent: (id, reviewer = 'Content Manager') => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              const newVersion = item.version + 1;
              const versionObj: AiContentVersion = {
                version: newVersion,
                content: item.editedContent,
                qualityScore: item.qualityScore,
                modifiedBy: reviewer,
                action: 'Approved by Reviewer',
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
              return {
                ...item,
                status: 'Approved' as AiContentStatus,
                approvedBy: reviewer,
                approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                version: newVersion,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                versions: [versionObj, ...item.versions],
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Content approved by ${reviewer}`,
            user: reviewer,
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'approved',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewer }),
        }).catch(() => {});
      },

      rejectContent: (id, reason = 'Does not align with tone') => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                status: 'Rejected' as AiContentStatus,
                reviewNotes: reason,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Content rejected: "${reason}"`,
            user: 'Reviewer',
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'rejected',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        }).catch(() => {});
      },

      requestChanges: (id, feedback) => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                status: 'Changes Requested' as AiContentStatus,
                reviewNotes: feedback,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Changes requested: "${feedback}"`,
            user: 'Reviewer',
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'reviewed',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}/request-changes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
        }).catch(() => {});
      },

      publishToCms: async (id, publishedBy = 'Admin') => {
        const item = get().items.find((i) => i.id === id);
        if (!item) {
          return { success: false, message: 'Content record not found.' };
        }

        // Strictly enforce approval requirement
        if (item.status !== 'Approved') {
          return {
            success: false,
            message: `Cannot publish to CMS. Status is "${item.status}". Only "Approved" content can be published.`,
          };
        }

        set((state) => {
          const items = state.items.map((i) => {
            if (i.id === id) {
              const newVersion = i.version + 1;
              const versionObj: AiContentVersion = {
                version: newVersion,
                content: i.editedContent,
                qualityScore: i.qualityScore,
                modifiedBy: publishedBy,
                action: 'Published to CMS',
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
              return {
                ...i,
                status: 'Published' as AiContentStatus,
                publishedBy,
                publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                version: newVersion,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                versions: [versionObj, ...i.versions],
              };
            }
            return i;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Content published to CMS by ${publishedBy} for ${item.productName}`,
            user: publishedBy,
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'published',
          };

          return { items, activities: [act, ...state.activities] };
        });

        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          await fetch(`${API_BASE}/api/ai-content/${id}/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publishedBy }),
          });
        } catch {}

        return { success: true, message: 'Content successfully published to CMS!' };
      },

      regenerateContent: (id, instruction) => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              const newVersion = item.version + 1;
              const current: any = item.editedContent || {};
              const updatedContent: any = {
                ...current,
                _regenerationNote: `Refined with instruction: "${instruction}"`,
              };

              if (instruction.includes('Shorter') && updatedContent.fullDescription) {
                updatedContent.fullDescription = updatedContent.fullDescription.slice(0, 300) + '...';
              } else if (instruction.includes('Premium')) {
                updatedContent.fullDescription = `A masterpiece of quiet luxury and artisanal poise. ` + (updatedContent.fullDescription || '');
              }

              const versionObj: AiContentVersion = {
                version: newVersion,
                content: updatedContent,
                qualityScore: Math.min(99, (item.qualityScore || 92) + 2),
                modifiedBy: 'Admin',
                action: `Regenerated (${instruction})`,
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };

              return {
                ...item,
                generatedContent: updatedContent,
                editedContent: updatedContent,
                version: newVersion,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                versions: [versionObj, ...item.versions],
              };
            }
            return item;
          });

          const act: AiActivityItem = {
            id: `ACT-${Date.now()}`,
            activity: `Regenerated with instruction: "${instruction}" for ${id}`,
            user: 'Admin',
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'regenerated',
          };

          return { items, activities: [act, ...state.activities] };
        });

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/ai-content/${id}/regenerate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction }),
        }).catch(() => {});
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        }));
      },
    }),
    {
      name: 'jodo-ai-content-storage',
    }
  )
);
