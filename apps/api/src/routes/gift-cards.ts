import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { GiftCard } from '../models/GiftCard';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

// Helper to generate unique GC code
const generateCode = () => {
  const segment1 = Math.random().toString(36).slice(2, 6).toUpperCase();
  const segment2 = Math.random().toString(36).slice(2, 6).toUpperCase();
  const segment3 = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GC-${segment1}-${segment2}-${segment3}`;
};

/**
 * GET /api/admin/gift-cards
 * List all gift cards for the store
 */
router.get('/', async (req, res, next) => {
  try {
    const cards = await GiftCard.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, cards);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/gift-cards
 * Issue a new gift card
 */
router.post('/', async (req, res, next) => {
  try {
    const { code, initialValue, expiryDate, recipientEmail, note } = req.body;

    if (!initialValue || parseFloat(initialValue) <= 0) {
      return sendError(res, 'Initial value must be greater than 0', 400);
    }

    let finalCode = code ? code.toString().toUpperCase().trim() : '';

    if (!finalCode) {
      // Loop to ensure uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        finalCode = generateCode();
        const existing = await GiftCard.findOne({ storeId: req.auth!.storeId, code: finalCode });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
    } else {
      // Validate custom code uniqueness
      const existing = await GiftCard.findOne({ storeId: req.auth!.storeId, code: finalCode });
      if (existing) {
        return sendError(res, 'Gift card code already exists', 400);
      }
    }

    const giftCard = await GiftCard.create({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      code: finalCode,
      initialValue: parseFloat(initialValue),
      balance: parseFloat(initialValue),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      recipientEmail,
      note,
      status: 'active',
    });

    sendSuccess(res, giftCard, 'Gift card issued successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/gift-cards/:id
 * Update status or adjust balance
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, balance, note, expiryDate } = req.body;

    const card = await GiftCard.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!card) {
      return sendError(res, 'Gift card not found', 404);
    }

    if (status) card.status = status;
    if (balance !== undefined) card.balance = parseFloat(balance);
    if (note !== undefined) card.note = note;
    if (expiryDate !== undefined) card.expiryDate = expiryDate ? new Date(expiryDate) : undefined;

    await card.save();

    sendSuccess(res, card, 'Gift card updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/gift-cards/:id
 * Delete/revoke a gift card
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await GiftCard.deleteOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Gift card not found or access denied', 404);
    }

    sendSuccess(res, null, 'Gift card revoked successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
