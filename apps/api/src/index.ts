import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import staffRoutes from './routes/staff';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import customersRoutes from './routes/customers';
import inventoryRoutes from './routes/inventory';
import discountsRoutes from './routes/discounts';
import appsRoutes from './routes/apps';

const app = express();

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max requests per window
  message: { success: false, message: 'Too many requests, please try again later' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for auth endpoints
  message: { success: false, message: 'Too many login attempts' },
});

app.use('/api/', limiter);

// ============================================================
// General Middleware
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    version: '0.1.0',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

import storeRoutes from './routes/store';

// ============================================================
// API Routes
// ============================================================
app.use('/api/admin/auth', authLimiter, authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/admin/store', storeRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/customers', customersRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/discounts', discountsRoutes);
app.use('/api/admin/apps', appsRoutes);

// ============================================================
// Error Handling
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================
async function bootstrap() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`\n🚀 Jodo API Server running at http://localhost:${env.PORT}`);
    console.log(`📚 Environment: ${env.NODE_ENV}`);
    console.log(`💾 Database: Connected to MongoDB`);
    console.log(`\n📋 Endpoints:`);
    console.log(`   GET  http://localhost:${env.PORT}/api/health`);
    console.log(`   POST http://localhost:${env.PORT}/api/admin/auth/login`);
    console.log(`   POST http://localhost:${env.PORT}/api/admin/auth/refresh`);
    console.log(`   GET  http://localhost:${env.PORT}/api/admin/auth/me`);
    console.log(`   GET  http://localhost:${env.PORT}/api/admin/dashboard/summary\n`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

export default app;
