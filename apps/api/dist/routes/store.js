"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Store_1 = require("../models/Store");
const response_1 = require("../utils/response");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireTenant);
/**
 * GET /api/admin/store
 * Get the current tenant's store details
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const store = await Store_1.Store.findOne({ tenantId }).lean();
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not found', 404);
        }
        (0, response_1.sendSuccess)(res, store);
    }
    catch (error) {
        console.error('Error fetching store:', error);
        (0, response_1.sendError)(res, 'Failed to fetch store details');
    }
});
/**
 * PUT /api/admin/store
 * Update the current tenant's store details
 */
router.put('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        // Extract standard fields
        const { name, defaultCurrency, defaultCountry, timezone, settings } = req.body;
        const store = await Store_1.Store.findOne({ tenantId });
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not found', 404);
        }
        // Update standard fields if provided
        if (name)
            store.name = name;
        if (defaultCurrency)
            store.defaultCurrency = defaultCurrency;
        if (defaultCountry)
            store.defaultCountry = defaultCountry;
        if (timezone)
            store.timezone = timezone;
        // Merge settings if provided
        if (settings) {
            store.settings = { ...store.settings, ...settings };
            // Mongoose mixed types need to be marked as modified
            store.markModified('settings');
        }
        await store.save();
        (0, response_1.sendSuccess)(res, store, 'Store details updated successfully');
    }
    catch (error) {
        console.error('Error updating store:', error);
        (0, response_1.sendError)(res, 'Failed to update store details');
    }
});
exports.default = router;
//# sourceMappingURL=store.js.map