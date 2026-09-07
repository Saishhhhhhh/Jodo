"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Media_1 = require("../models/Media");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const UPLOADS_DIR = path_1.default.join(__dirname, '../../public/uploads');
// Ensure uploads directory exists
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
router.get('/', async (req, res, next) => {
    try {
        const media = await Media_1.Media.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, media);
    }
    catch (error) {
        next(error);
    }
});
router.post('/upload', async (req, res, next) => {
    try {
        const { filename, mimeType, size, base64Data } = req.body;
        if (!filename || !base64Data) {
            return (0, response_1.sendError)(res, 'Missing file data', 400);
        }
        // Decode base64
        // Format is usually "data:image/png;base64,iVBORw0KGgo..."
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return (0, response_1.sendError)(res, 'Invalid base64 data', 400);
        }
        const type = matches[1];
        const data = Buffer.from(matches[2], 'base64');
        // Create unique filename
        const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path_1.default.join(UPLOADS_DIR, uniqueFilename);
        const fileUrl = `/uploads/${uniqueFilename}`;
        // Write to local disk
        fs_1.default.writeFileSync(filePath, data);
        const media = new Media_1.Media({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            filename,
            url: fileUrl,
            mimeType: type || mimeType,
            size: data.length || size,
        });
        await media.save();
        (0, response_1.sendSuccess)(res, media, 'File uploaded successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const media = await Media_1.Media.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!media)
            return (0, response_1.sendError)(res, 'Media not found', 404);
        // Try to delete local file
        try {
            const filename = media.url.split('/').pop();
            if (filename) {
                const filePath = path_1.default.join(UPLOADS_DIR, filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
        }
        catch (e) {
            console.error('Failed to delete local file', e);
        }
        (0, response_1.sendSuccess)(res, null, 'Media deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=media.js.map