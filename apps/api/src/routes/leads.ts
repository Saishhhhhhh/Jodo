import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Lead } from '../models/Lead';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

// GET all leads with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, source, search } = req.query;
    
    const query: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };

    if (status) query.status = status;
    if (priority) query.followUpPriority = priority;
    if (source) query.source = source;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
    sendSuccess(res, leads);
  } catch (error) {
    next(error);
  }
});

// POST a new lead
router.post('/', async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };

    const lead = new Lead(leadData);
    await lead.save();

    sendSuccess(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
});

// PUT update a lead
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findOneAndUpdate(
      { _id: id, tenantId: req.auth!.tenantId, storeId: req.auth!.storeId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
});

// DELETE a lead
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findOneAndDelete({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
