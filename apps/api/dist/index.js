"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
// Route imports
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const staff_1 = __importDefault(require("./routes/staff"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const customers_1 = __importDefault(require("./routes/customers"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const discounts_1 = __importDefault(require("./routes/discounts"));
const apps_1 = __importDefault(require("./routes/apps"));
const audit_logs_1 = __importDefault(require("./routes/audit-logs"));
const collections_1 = __importDefault(require("./routes/collections"));
const gift_cards_1 = __importDefault(require("./routes/gift-cards"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const returns_1 = __importDefault(require("./routes/returns"));
const segments_1 = __importDefault(require("./routes/segments"));
const campaigns_1 = __importDefault(require("./routes/campaigns"));
const banners_1 = __importDefault(require("./routes/banners"));
const media_1 = __importDefault(require("./routes/media"));
const navigation_1 = __importDefault(require("./routes/navigation"));
const storefront_1 = __importDefault(require("./routes/storefront"));
const storefront_auth_1 = __importDefault(require("./routes/storefront-auth"));
const app = (0, express_1.default)();
// ============================================================
// Security Middleware
// ============================================================
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [env_1.env.CORS_ORIGIN, 'http://localhost:3001'];
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Max requests per window
    message: { success: false, message: 'Too many requests, please try again later' },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20, // Strict limit for auth endpoints
    message: { success: false, message: 'Too many login attempts' },
});
app.use('/api/', limiter);
// ============================================================
// General Middleware
// ============================================================
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        version: '0.1.0',
        env: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
const store_1 = __importDefault(require("./routes/store"));
// ============================================================
// API Routes
// ============================================================
app.use('/api/admin/auth', authLimiter, auth_1.default);
app.use('/api/admin/dashboard', dashboard_1.default);
app.use('/api/admin/staff', staff_1.default);
app.use('/api/admin/store', store_1.default);
app.use('/api/admin/products', products_1.default);
app.use('/api/admin/orders', orders_1.default);
app.use('/api/admin/customers', customers_1.default);
app.use('/api/admin/inventory', inventory_1.default);
app.use('/api/admin/discounts', discounts_1.default);
app.use('/api/admin/apps', apps_1.default);
app.use('/api/admin/audit-logs', audit_logs_1.default);
app.use('/api/admin/collections', collections_1.default);
app.use('/api/admin/gift-cards', gift_cards_1.default);
app.use('/api/admin/reviews', reviews_1.default);
app.use('/api/admin/returns', returns_1.default);
app.use('/api/admin/customers/segments', segments_1.default);
app.use('/api/admin/campaigns', campaigns_1.default);
app.use('/api/admin/banners', banners_1.default);
app.use('/api/admin/media', media_1.default);
app.use('/api/admin/navigation', navigation_1.default);
app.use('/api/storefront', storefront_1.default);
app.use('/api/storefront/auth', storefront_auth_1.default);
// ============================================================
// Error Handling
// ============================================================
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// ============================================================
// Start Server
// ============================================================
async function bootstrap() {
    await (0, db_1.connectDB)();
    app.listen(env_1.env.PORT, () => {
        console.log(`\n🚀 Jodo API Server running at http://localhost:${env_1.env.PORT}`);
        console.log(`📚 Environment: ${env_1.env.NODE_ENV}`);
        console.log(`💾 Database: Connected to MongoDB`);
        console.log(`\n📋 Endpoints:`);
        console.log(`   GET  http://localhost:${env_1.env.PORT}/api/health`);
        console.log(`   POST http://localhost:${env_1.env.PORT}/api/admin/auth/login`);
        console.log(`   POST http://localhost:${env_1.env.PORT}/api/admin/auth/refresh`);
        console.log(`   GET  http://localhost:${env_1.env.PORT}/api/admin/auth/me`);
        console.log(`   GET  http://localhost:${env_1.env.PORT}/api/admin/dashboard/summary\n`);
    });
}
bootstrap().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map