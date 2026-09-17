import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Customer } from '../models/Customer';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/admin/customers
 * List all customers
 */
router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, customers);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/customers
 * Create a new customer profile
 */
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, status, password } = req.body;

    if (!firstName || !lastName || !email) {
      return sendError(res, 'First name, last name, and email are required', 400);
    }

    if (password && (typeof password !== 'string' || password.length < 6)) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // Check if customer email already exists for this store
    const existingCustomer = await Customer.findOne({
      storeId: req.auth!.storeId,
      email: email.toLowerCase(),
    });

    if (existingCustomer) {
      return sendError(res, 'A customer with this email already exists in your store', 400);
    }

    const customer = new Customer({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      status: status || 'active',
      ordersCount: 0,
      totalSpent: 0,
      ...(password ? { passwordHash: password } : {}),
    });

    await customer.save();
    sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/customers/:id/reset-password
 * Reset / update customer login password
 */
router.post('/:id/reset-password', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!customer) {
      return sendError(res, 'Customer profile not found', 404);
    }

    // Assign new password (pre-save hook will hash it with bcrypt)
    customer.passwordHash = password;
    await customer.save();

    // Record audit log entry
    try {
      await AuditLog.create({
        tenantId: req.auth!.tenantId,
        storeId: req.auth!.storeId,
        actorUserId: req.auth!.userId,
        actorType: 'user',
        action: 'customer.password_reset',
        resourceType: 'Customer',
        resourceId: customer._id.toString(),
        after: {
          customerId: customer._id.toString(),
          email: customer.email,
        },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    } catch (auditErr) {
      console.warn('Failed to record audit log for customer password reset:', auditErr);
    }

    sendSuccess(res, { customerId: customer._id, email: customer.email }, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/customers/:id
 * Update customer details
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, status, loyaltyPoints, walletBalance, password } = req.body;

    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!customer) {
      return sendError(res, 'Customer profile not found', 404);
    }

    if (email && email.toLowerCase() !== customer.email) {
      // Validate unique email in store
      const emailConflict = await Customer.findOne({
        storeId: req.auth!.storeId,
        email: email.toLowerCase(),
        _id: { $ne: customer._id },
      });
      if (emailConflict) {
        return sendError(res, 'A customer with this email already exists', 400);
      }
      customer.email = email.toLowerCase();
    }

    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (phone !== undefined) customer.phone = phone;
    if (status) customer.status = status;
    if (loyaltyPoints !== undefined) customer.loyaltyPoints = loyaltyPoints;
    if (walletBalance !== undefined) customer.walletBalance = walletBalance;
    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }
      customer.passwordHash = password;
    }

    await customer.save();
    sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/customers/:id
 * Remove customer profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!customer) {
      return sendError(res, 'Customer profile not found', 404);
    }

    sendSuccess(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
