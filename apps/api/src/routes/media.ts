import { Router } from 'express';
import { Media } from '../models/Media';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(requireAuth);

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

router.get('/', async (req, res, next) => {
  try {
    const media = await Media.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });
    sendSuccess(res, media);
  } catch (error) {
    next(error);
  }
});

router.post('/upload', async (req, res, next) => {
  try {
    const { filename, mimeType, size, base64Data } = req.body;

    if (!filename || !base64Data) {
      return sendError(res, 'Missing file data', 400);
    }

    // Decode base64
    // Format is usually "data:image/png;base64,iVBORw0KGgo..."
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return sendError(res, 'Invalid base64 data', 400);
    }

    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    
    // Create unique filename
    const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Write to local disk
    fs.writeFileSync(filePath, data);

    const media = new Media({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      filename,
      url: fileUrl,
      mimeType: type || mimeType,
      size: data.length || size,
    });

    await media.save();
    sendSuccess(res, media, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const media = await Media.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    if (!media) return sendError(res, 'Media not found', 404);

    // Try to delete local file
    try {
      const filename = media.url.split('/').pop();
      if (filename) {
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.error('Failed to delete local file', e);
    }

    sendSuccess(res, null, 'Media deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
