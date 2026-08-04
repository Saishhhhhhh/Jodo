import express from 'express';
import path from 'path';
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
import auditLogsRoutes from './routes/audit-logs';
import collectionsRoutes from './routes/collections';
import giftCardsRoutes from './routes/gift-cards';
import reviewsRoutes from './routes/reviews';
import returnsRoutes from './routes/returns';
import segmentsRoutes from './routes/segments';
import campaignsRoutes from './routes/campaigns';
import bannersRoutes from './routes/banners';
import mediaRoutes from './routes/media';
import navigationRoutes from './routes/navigation';
import storefrontRoutes from './routes/storefront';
import storefrontAuthRoutes from './routes/storefront-auth';

const app = express();

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      const allowedOrigins = [env.CORS_ORIGIN, 'http://localhost:3001'];
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.use('/api/admin/audit-logs', auditLogsRoutes);
app.use('/api/admin/collections', collectionsRoutes);
app.use('/api/admin/gift-cards', giftCardsRoutes);
app.use('/api/admin/reviews', reviewsRoutes);
app.use('/api/admin/returns', returnsRoutes);
app.use('/api/admin/customers/segments', segmentsRoutes);
app.use('/api/admin/campaigns', campaignsRoutes);
app.use('/api/admin/banners', bannersRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin/navigation', navigationRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/storefront/auth', storefrontAuthRoutes);
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
