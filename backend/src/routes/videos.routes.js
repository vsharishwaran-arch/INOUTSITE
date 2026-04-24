import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadVideo } from '../middleware/upload.js';
import {
  listVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementViews,
  uploadVideoFile,
} from '../controllers/videos.controller.js';

const router = Router();

// Helper to wrap multer middleware with error handling
function handleMulterError(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return next(err);
      }
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
