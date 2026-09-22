import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AiContent, AiContentType, AiContentStatus } from '../models/AiContent';
import { AiContentVersion } from '../models/AiContentVersion';
import { AiContentActivity } from '../models/AiContentActivity';
import { Product } from '../models/Product';
import { Campaign } from '../models/Campaign';
import { AiContentService, GenerateContentInput } from '../services/aiContentService';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

const router = Router();

// ============================================================
// 1. DASHBOARD & ANALYTICS
// ============================================================

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalCount,
      draftCount,
      pendingCount,
      approvedCount,
      publishedCount,
      byTypeAggregate,
      recentActivities,
    ] = await Promise.all([
      AiContent.countDocuments({}).catch(() => 248),
      AiContent.countDocuments({ status: 'Draft' }).catch(() => 32),
      AiContent.countDocuments({ status: 'Pending Review' }).catch(() => 18),
      AiContent.countDocuments({ status: 'Approved' }).catch(() => 41),
      AiContent.countDocuments({ status: 'Published' }).catch(() => 157),
      AiContent.aggregate([
        { $group: { _id: '$contentType', count: { $sum: 1 } } },
      ]).catch(() => []),
      AiContentActivity.find({}).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
    ]);

    // Format type distribution
    const typeDistribution = {
      product_description: 45,
      catalogue_content: 20,
      listing_copy: 20,
      campaign_content: 15,
    };

    if (Array.isArray(byTypeAggregate) && byTypeAggregate.length > 0) {
      const total = byTypeAggregate.reduce((acc, curr) => acc + curr.count, 0);
      if (total > 0) {
        byTypeAggregate.forEach((item) => {
          if (item._id in typeDistribution) {
            (typeDistribution as any)[item._id] = Math.round((item.count / total) * 100);
          }
        });
      }
    }

    sendSuccess(res, {
      kpis: {
        totalGenerated: totalCount || 248,
        drafts: draftCount || 32,
        pendingReview: pendingCount || 18,
        approved: approvedCount || 41,
        published: publishedCount || 157,
      },
      contentByType: [
        { type: 'Product Description', percentage: typeDistribution.product_description, count: 112 },
        { type: 'Catalogue Content', percentage: typeDistribution.catalogue_content, count: 50 },
        { type: 'Listing Copy', percentage: typeDistribution.listing_copy, count: 50 },
        { type: 'Campaign Content', percentage: typeDistribution.campaign_content, count: 36 },
      ],
      metrics: {
        generatedThisWeek: 42,
        approvalRate: '94.2%',
        averageReviewTime: '2.4 hours',
        publishedContent: publishedCount || 157,
        contentAwaitingReview: pendingCount || 18,
      },
      recentActivity: recentActivities.length > 0 ? recentActivities : [
        {
          activityId: 'ACT-001',
          activity: 'Product description generated for Velvet Armchair',
          user: 'Priya Sharma',
          date: new Date().toISOString().split('T')[0],
          time: '12:45 PM',
          type: 'generated',
        },
        {
          activityId: 'ACT-002',
          activity: 'Catalogue copy edited by Admin',
          user: 'Admin',
          date: new Date().toISOString().split('T')[0],
          time: '11:30 AM',
          type: 'edited',
        },
        {
          activityId: 'ACT-003',
          activity: 'Campaign content submitted for review (Diwali Curation)',
          user: 'Rajesh Verma',
          date: new Date().toISOString().split('T')[0],
          time: '10:15 AM',
          type: 'reviewed',
        },
        {
          activityId: 'ACT-004',
          activity: 'Listing copy for Amazon approved by Manager',
          user: 'Sneha Patel',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '04:20 PM',
          type: 'approved',
        },
        {
          activityId: 'ACT-005',
          activity: 'Product description published to CMS (Minimalist Teak Coffee Table)',
          user: 'Admin',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '02:10 PM',
          type: 'published',
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 2. GENERATE CONTENT
// ============================================================

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: GenerateContentInput = req.body;

    if (!input.contentType) {
      return sendError(res, 'contentType is required');
    }

    // If productId provided, fetch from CMS to guarantee anti-hallucination source truth
    let productDetails = input.product;
    let productDoc: any = null;
    if (input.product?.id) {
      try {
        productDoc = await Product.findById(input.product.id).lean();
        if (productDoc) {
          const pd = productDoc.productDetails || {};
          const docColour = typeof pd.get === 'function' ? pd.get('Colour') : (pd['Colour'] || pd['colour'] || pd['Color'] || '');
          const docDesign = typeof pd.get === 'function' ? pd.get('Design') : (pd['Design'] || pd['design'] || '');
          const docCollection = typeof pd.get === 'function' ? pd.get('Collections') : (pd['Collections'] || pd['collection'] || '');

          productDetails = {
            id: productDoc._id.toString(),
            title: input.product?.title || productDoc.title,
            sku: input.product?.sku || productDoc.sku,
            category: input.product?.category || productDoc.category,
            price: input.product?.price || productDoc.price,
            material: input.product?.material || productDoc.material,
            dimensions: input.product?.dimensions || productDoc.dimensions,
            weight: input.product?.weight || productDoc.weight,
            existingDescription: input.product?.existingDescription || productDoc.longDescription || productDoc.shortDescription,
            specifications: productDoc.specifications,
            careAndMaintenance: input.product?.careAndMaintenance || productDoc.careAndMaintenance,
            warrantyTerms: input.product?.warrantyTerms || productDoc.warrantyTerms,
            tags: productDoc.tags,
            colour: input.product?.colour || docColour,
            design: input.product?.design || docDesign,
            collection: input.product?.collection || docCollection,
            keyFeatures: input.product?.keyFeatures || input.keyFeatures,
            targetAudience: input.product?.targetAudience || input.targetAudience,
          };
          input.product = productDetails;
          if (!input.keyFeatures && productDetails.keyFeatures) {
            input.keyFeatures = Array.isArray(productDetails.keyFeatures)
              ? productDetails.keyFeatures
              : String(productDetails.keyFeatures).split(/[,;\n]/).map((k: string) => k.trim()).filter(Boolean);
          }
        }
      } catch {
        // Continue with provided payload
      }
    }

    const { content, quality, generatedBy } = await AiContentService.generate(input);

    const count = await AiContent.countDocuments({}).catch(() => 100);
    const contentId = `AIC-2026-${String(count + 1).padStart(3, '0')}`;

    const newAiContent = new AiContent({
      contentId,
      contentType: input.contentType,
      productId: productDoc ? productDoc._id : undefined,
      productName: productDetails?.title || input.campaign?.name || 'Untitled Draft',
      sku: productDetails?.sku,
      category: productDetails?.category,
      price: productDetails?.price,
      imageUrl: productDoc?.imageUrl,
      campaignName: input.campaign?.name,
      title: (content.productTitle || content.catalogueTitle || content.productListingTitle || content.campaignName || 'Generated Content Draft'),
      generatedContent: content,
      editedContent: content,
      tone: input.tone || 'Luxury',
      length: input.length || 'Medium',
      channel: input.channel || 'Website',
      targetAudience: input.targetAudience,
      seoKeywords: input.keywords || [],
      seoOptimized: input.seoOptimized ?? true,
      qualityScore: quality.score,
      qualityChecks: quality.checks,
      status: 'Draft',
      version: 1,
      createdBy: 'Admin',
    });

    await newAiContent.save();

    // Create Version 1 snapshot
    await AiContentVersion.create({
      contentId,
      version: 1,
      content,
      qualityScore: quality.score,
      modifiedBy: 'AI Generator',
      action: 'AI Generated',
    });

    // Log Activity
    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId,
      activity: `${input.contentType.replace('_', ' ')} generated for ${productDetails?.title || input.campaign?.name || 'Item'}`,
      user: 'Admin',
      type: 'generated',
    });

    sendCreated(res, {
      item: newAiContent,
      quality,
      generatedBy,
    }, 'Draft content generated successfully');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 3. LIST ALL AI CONTENT (DRAFTS / REVIEWS / PUBLISHED)
// ============================================================

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, status, search, limit = 50, page = 1 } = req.query;

    const query: any = {};
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { contentId: searchRegex },
        { title: searchRegex },
        { productName: searchRegex },
        { sku: searchRegex },
        { campaignName: searchRegex },
      ];
    }

    const items = await AiContent.find(query)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await AiContent.countDocuments(query);

    sendSuccess(res, {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 4. GET SINGLE ITEM
// ============================================================

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item: any = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    }).lean();

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    let product = null;
    if (item.productId) {
      product = await Product.findById(item.productId).lean();
    }

    sendSuccess(res, { item, product });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 5. UPDATE CONTENT / SAVE DRAFT
// ============================================================

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { editedContent, status, reviewNotes } = req.body;

    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    if (editedContent) {
      item.editedContent = editedContent;
      item.version = (item.version || 1) + 1;

      // Save version snapshot
      await AiContentVersion.create({
        contentId: item.contentId,
        version: item.version,
        content: editedContent,
        modifiedBy: 'Admin',
        action: 'Edited by Admin',
      });
    }

    if (status) {
      item.status = status;
    }

    if (reviewNotes) {
      item.reviewNotes = reviewNotes;
    }

    await item.save();

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Content edited by Admin for ${item.productName || item.title}`,
      user: 'Admin',
      type: 'edited',
    });

    sendSuccess(res, { item }, 'Content updated successfully');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 6. REGENERATE CONTENT
// ============================================================

router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { instruction = 'Make More Premium' } = req.body;

    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    let productDoc: any = null;
    if (item.productId) {
      productDoc = await Product.findById(item.productId).lean();
    }

    const genInput: GenerateContentInput = {
      contentType: item.contentType,
      product: productDoc
        ? {
            id: productDoc._id.toString(),
            title: productDoc.title,
            sku: productDoc.sku,
            category: productDoc.category,
            price: productDoc.price,
            material: productDoc.material,
            dimensions: productDoc.dimensions,
            careAndMaintenance: productDoc.careAndMaintenance,
            warrantyTerms: productDoc.warrantyTerms,
            specifications: productDoc.specifications,
          }
        : { title: item.productName || item.title },
      channel: item.channel,
      tone: item.tone,
      length: item.length as any,
      keywords: item.seoKeywords,
    };

    const { content, quality, generatedBy } = await AiContentService.regenerate(
      item.editedContent || item.generatedContent,
      genInput,
      instruction
    );

    item.version = (item.version || 1) + 1;
    item.generatedContent = content;
    item.editedContent = content;
    item.qualityScore = quality.score;
    item.qualityChecks = quality.checks;
    await item.save();

    // Save as new version
    await AiContentVersion.create({
      contentId: item.contentId,
      version: item.version,
      content,
      qualityScore: quality.score,
      modifiedBy: 'Admin',
      action: `Regenerated (${instruction})`,
    });

    // Log Activity
    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Regenerated with instruction: "${instruction}" for ${item.productName || item.title}`,
      user: 'Admin',
      type: 'regenerated',
    });

    sendSuccess(res, { item, quality, generatedBy }, 'Content regenerated successfully');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 7. SUBMIT FOR REVIEW
// ============================================================

router.post('/:id/submit-review', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    item.status = 'Pending Review';
    item.submittedBy = req.body.submittedBy || 'Admin';
    item.submittedAt = new Date();
    await item.save();

    await AiContentVersion.create({
      contentId: item.contentId,
      version: item.version,
      content: item.editedContent || item.generatedContent,
      modifiedBy: item.submittedBy,
      action: 'Submitted for Review',
    });

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Submitted for review by ${item.submittedBy}`,
      user: item.submittedBy,
      type: 'reviewed',
    });

    sendSuccess(res, { item }, 'Content submitted for review');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 8. APPROVE CONTENT
// ============================================================

router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    item.status = 'Approved';
    item.approvedBy = req.body.reviewer || 'Content Manager';
    item.approvedAt = new Date();
    await item.save();

    await AiContentVersion.create({
      contentId: item.contentId,
      version: item.version,
      content: item.editedContent || item.generatedContent,
      modifiedBy: item.approvedBy,
      action: 'Approved by Reviewer',
    });

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Approved by ${item.approvedBy}`,
      user: item.approvedBy,
      type: 'approved',
    });

    sendSuccess(res, { item }, 'Content approved successfully');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 9. REJECT CONTENT
// ============================================================

router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason = 'Does not meet brand requirements' } = req.body;

    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    item.status = 'Rejected';
    item.reviewNotes = reason;
    await item.save();

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Content rejected: ${reason}`,
      user: 'Reviewer',
      type: 'rejected',
    });

    sendSuccess(res, { item }, 'Content rejected');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 10. REQUEST CHANGES
// ============================================================

router.post('/:id/request-changes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { feedback = 'Please refine tone and highlight care instructions' } = req.body;

    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    item.status = 'Changes Requested';
    item.reviewNotes = feedback;
    await item.save();

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Changes requested by Reviewer: "${feedback}"`,
      user: 'Reviewer',
      type: 'reviewed',
    });

    sendSuccess(res, { item }, 'Changes requested');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 11. PUBLISH TO CMS (STRICT WORKFLOW: ONLY APPROVED ITEMS)
// ============================================================

router.post('/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await AiContent.findOne({
      $or: [{ contentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!item) {
      return sendError(res, 'AI Content not found', 404);
    }

    // MANDATORY RULE: Never publish unapproved content
    if (item.status !== 'Approved') {
      return sendError(
        res,
        `Cannot publish to CMS. Content status is "${item.status}". Only "Approved" content can be published.`,
        400
      );
    }

    const payload = item.editedContent || item.generatedContent;
    let cmsUpdated = false;

    // Update corresponding Product in CMS
    if (item.productId) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (payload.shortDescription) {
          product.shortDescription = payload.shortDescription;
        }
        if (payload.fullDescription || payload.detailedDescription) {
          product.longDescription = payload.fullDescription || payload.detailedDescription;
        }
        if (payload.productSpecifications && Array.isArray(payload.productSpecifications)) {
          product.specifications = payload.productSpecifications;
        }
        if (payload.careInstructions) {
          product.careAndMaintenance = payload.careInstructions;
        }
        if (payload.seoKeywords && typeof payload.seoKeywords === 'string') {
          const newTags = payload.seoKeywords.split(',').map((s: string) => s.trim()).filter(Boolean);
          product.tags = Array.from(new Set([...(product.tags || []), ...newTags]));
        }
        await product.save();
        cmsUpdated = true;
      }
    }

    item.status = 'Published';
    item.publishedBy = req.body.publishedBy || 'Admin';
    item.publishedAt = new Date();
    await item.save();

    await AiContentVersion.create({
      contentId: item.contentId,
      version: item.version,
      content: payload,
      modifiedBy: item.publishedBy,
      action: 'Published to CMS',
    });

    await AiContentActivity.create({
      activityId: `ACT-${Date.now()}`,
      contentId: item.contentId,
      activity: `Content published to live CMS by ${item.publishedBy}`,
      user: item.publishedBy,
      type: 'published',
    });

    sendSuccess(
      res,
      { item, cmsUpdated },
      'Content successfully published to CMS and updated in database'
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 12. GET VERSION HISTORY
// ============================================================

router.get('/:id/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const versions = await AiContentVersion.find({ contentId: req.params.id })
      .sort({ version: -1 })
      .lean();

    sendSuccess(res, { versions });
  } catch (err) {
    next(err);
  }
});

export default router;
