import { Router } from 'express';
import { Customer } from '../models/Customer';
import { Store } from '../models/Store';
import { sendSuccess, sendError } from '../utils/response';
import { signAccessToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();

// Registration Route
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return sendError(res, 'All fields are required', 400);
    }

    // Since this is a storefront, we fetch the default store
    const store = await Store.findOne();
    if (!store) {
      return sendError(res, 'Store not configured', 500);
    }

    const existingCustomer = await Customer.findOne({ email, storeId: store._id });
    if (existingCustomer) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const customer = new Customer({
      tenantId: store.tenantId,
      storeId: store._id,
      firstName,
      lastName,
      email,
      passwordHash: password, // The pre-save hook will hash this!
    });

    await customer.save();

    const token = signAccessToken({
      sub: customer._id.toString(),
      tenantId: customer.tenantId.toString(),
      storeId: customer.storeId.toString(),
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
    });

    sendSuccess(res, { token, customer }, 'Registration successful');
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const store = await Store.findOne();
    if (!store) {
      return sendError(res, 'Store not configured', 500);
    }

    const customer = await Customer.findOne({ email, storeId: store._id }).select('+passwordHash');
    if (!customer) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!customer.passwordHash) {
      return sendError(res, 'This account cannot be logged in with a password. Please contact support.', 401);
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = signAccessToken({
      sub: customer._id.toString(),
      tenantId: customer.tenantId.toString(),
      storeId: customer.storeId.toString(),
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
    });

    // Remove passwordHash from response
    customer.passwordHash = undefined;

    sendSuccess(res, { token, customer }, 'Login successful');
  } catch (error) {
    next(error);
  }
});

// Get Current Customer
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    const customer = await Customer.findById(decoded.sub);
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    sendSuccess(res, { customer }, 'Customer retrieved successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
