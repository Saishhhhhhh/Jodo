import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Product } from '../models/Product';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
});

// GET SINGLE
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
});

// CREATE
router.post('/', async (req, res, next) => {
  try {
    const { title, sku, price, compareAtPrice, inventoryQuantity, category, vendor, imageUrl, galleryImages, model3dUrl, videoUrl, brochureUrl, barcode, status, material, dimensions, weight, assemblyRequired, shortDescription, longDescription, emiAvailable, emiStartingFrom, additionalOffers, assemblyFee, careAndMaintenance, warrantyTerms, productDetails, specifications } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = await Product.create({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      title,
      slug,
      sku,
      barcode,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      inventoryQuantity: parseInt(inventoryQuantity, 10),
      category,
      vendor,
      imageUrl,
      galleryImages: galleryImages || [],
      model3dUrl,
      videoUrl,
      brochureUrl,
      status,
      material,
      dimensions,
      weight: weight ? parseFloat(weight) : undefined,
      assemblyRequired: assemblyRequired === true || assemblyRequired === 'true',
      shortDescription,
      longDescription,
      emiAvailable: emiAvailable === true || emiAvailable === 'true',
      emiStartingFrom: emiStartingFrom ? parseFloat(emiStartingFrom) : undefined,
      additionalOffers: additionalOffers || [],
      assemblyFee: assemblyFee ? parseFloat(assemblyFee) : undefined,
      careAndMaintenance,
      warrantyTerms,
      productDetails,
      specifications: specifications || [],
    });

    sendSuccess(res, newProduct, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
});

// UPDATE
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, sku, price, compareAtPrice, inventoryQuantity, category, vendor, imageUrl, galleryImages, model3dUrl, videoUrl, brochureUrl, barcode, status, material, dimensions, weight, assemblyRequired, shortDescription, longDescription, emiAvailable, emiStartingFrom, additionalOffers, assemblyFee, careAndMaintenance, warrantyTerms, productDetails, specifications } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.auth!.tenantId, storeId: req.auth!.storeId },
      {
        title,
        sku,
        barcode,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        inventoryQuantity: parseInt(inventoryQuantity, 10),
        category,
        vendor,
        imageUrl,
        galleryImages: galleryImages || [],
        model3dUrl,
        videoUrl,
        brochureUrl,
        status,
        material,
        dimensions,
        weight: weight ? parseFloat(weight) : undefined,
        assemblyRequired: assemblyRequired === true || assemblyRequired === 'true',
        shortDescription,
        longDescription,
        emiAvailable: emiAvailable === true || emiAvailable === 'true',
        emiStartingFrom: emiStartingFrom ? parseFloat(emiStartingFrom) : undefined,
        additionalOffers: additionalOffers || [],
        assemblyFee: assemblyFee ? parseFloat(assemblyFee) : undefined,
        careAndMaintenance,
        warrantyTerms,
        productDetails,
        specifications: specifications || [],
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOneAndDelete({ 
      _id: id, 
      tenantId: req.auth!.tenantId, 
      storeId: req.auth!.storeId 
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
