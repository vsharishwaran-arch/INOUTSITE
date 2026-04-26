import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadVideo } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';
import {
  listVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementViews,
  uploadVideoFile,
} from '../controllers/videos.controller.js';

const router = Router();

// Enhanced multer error handler with better logging for videos
function handleMulterError(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        logger.error(`🔴 Multer video error: ${err.message}`);
        logger.error(`🔴 Error code: ${err.code}`);
        
        // Add file info to request even if multer fails
        if (!req.file) req.file = null;
        
        // Handle specific multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Video file too large (max 200MB)' });
        }
        
        // For MIME type or other errors, continue
        logger.warn(`⚠️ Multer error but continuing: ${err.message}`);
      }
      
      logger.info(`📹 Multer completed. req.file: ${req.file ? 'exists' : 'missing'}`);
      next();
    });
  };
}

// Public — list active videos (admin sees all)
router.get('/', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authenticate(req, res, () => listVideos(req, res, next));
  }
  listVideos(req, res, next);
});

// Public — increment view count
router.post('/:id/view', incrementViews);

// Admin only
// NOTE: Specific routes (/upload) must come BEFORE generic routes (/) in Express
router.post('/upload', authenticate, requireAdmin, handleMulterError(uploadVideo.single('video')), uploadVideoFile);
router.post('/', authenticate, requireAdmin, createVideo);
router.patch('/:id', authenticate, requireAdmin, updateVideo);
router.delete('/:id', authenticate, requireAdmin, deleteVideo);

export default router;
