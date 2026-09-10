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
        specifications?: {
            key: string;
            value: string;
        }[];
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
export declare class AiContentService {
    /**
     * Anti-hallucination validation and quality score assessment
     */
    static assessQuality(content: Record<string, any>, input: GenerateContentInput): QualityCheckResult;
    /**
     * Generate draft content based on content type, channel, and CMS data
     */
    static generate(input: GenerateContentInput): Promise<{
        content: Record<string, any>;
        quality: QualityCheckResult;
    }>;
    /**
     * Regenerate draft content with modifier preset or custom instruction
     */
    static regenerate(currentContent: Record<string, any>, input: GenerateContentInput, instruction: string): Promise<{
        content: Record<string, any>;
        quality: QualityCheckResult;
    }>;
    private static generateProductDescription;
    private static generateCatalogueContent;
    private static generateListingCopy;
    private static generateCampaignContent;
}
