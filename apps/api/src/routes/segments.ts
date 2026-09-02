import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { CustomerSegment } from '../models/CustomerSegment';
import { Customer } from '../models/Customer';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

/**
 * Helper to translate segment rules into a MongoDB find query
 */
function buildMongoQuery(rules: any[], tenantId: any, storeId: any) {
  const query: any = { tenantId, storeId };

  rules.forEach((rule) => {
    const { field, operator, value } = rule;

    // Convert string numeric values to actual numbers if applicable
    let parsedValue = value;
    if (field === 'totalSpent' || field === 'ordersCount') {
      const num = Number(value);
      if (!isNaN(num)) {
        parsedValue = num;
      }
    }

    if (field === 'tags') {
      if (operator === 'ne') {
        query['tags'] = { $ne: parsedValue };
      } else {
        query['tags'] = parsedValue;
      }
      return;
    }

    if (operator === 'eq') {
      query[field] = parsedValue;
    } else {
      const mongoOperator = `$${operator}`;
      query[field] = {
        ...query[field],
        [mongoOperator]: parsedValue,
      };
    }
  });

  return query;
}

/**
 * GET /api/admin/returns
 * List all saved segments with calculated member counts
 */
router.get('/', async (req, res, next) => {
  try {
    const segments = await CustomerSegment.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    // Calculate dynamic counts
    const enrichedSegments = await Promise.all(
      segments.map(async (segment) => {
        const query = buildMongoQuery(
          segment.rules,
          req.auth!.tenantId,
          req.auth!.storeId
        );
        const count = await Customer.countDocuments(query);
        
        return {
          ...segment.toObject(),
          memberCount: count,
        };
      })
    );

    sendSuccess(res, enrichedSegments);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/returns/:id
 * Retrieve segment and evaluate rules to return matching customers list
 */
router.get('/:id', async (req, res, next) => {
  try {
    const segment = await CustomerSegment.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!segment) {
      return sendError(res, 'Customer segment not found', 404);
    }

    const query = buildMongoQuery(
      segment.rules,
      req.auth!.tenantId,
      req.auth!.storeId
    );

    const customers = await Customer.find(query).sort({ totalSpent: -1 });

    sendSuccess(res, {
      segment,
      customers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/returns
 * Create a new customer segment
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description, rules } = req.body;

    if (!name || !rules || !Array.isArray(rules) || rules.length === 0) {
      return sendError(res, 'Name and query rules are required', 400);
    }

    // Check unique name in store
    const existingSegment = await CustomerSegment.findOne({
      storeId: req.auth!.storeId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingSegment) {
      return sendError(res, 'A segment with this name already exists', 400);
    }

    const segment = new CustomerSegment({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      name,
      description,
      rules,
    });

    await segment.save();
    
    // Evaluate count for client convenience
    const query = buildMongoQuery(rules, req.auth!.tenantId, req.auth!.storeId);
    const count = await Customer.countDocuments(query);

    sendSuccess(
      res, 
      { ...segment.toObject(), memberCount: count }, 
      'Customer segment saved successfully', 
      201
    );
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/returns/:id
 * Remove a customer segment profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const segment = await CustomerSegment.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!segment) {
      return sendError(res, 'Customer segment not found', 404);
    }

    sendSuccess(res, null, 'Customer segment deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
