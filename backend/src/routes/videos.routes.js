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
router.post('/', authenticate, requireAdmin, createVideo);
router.post('/upload', authenticate, requireAdmin, uploadVideo.single('video'), uploadVideoFile);
router.patch('/:id', authenticate, requireAdmin, updateVideo);
router.delete('/:id', authenticate, requireAdmin, deleteVideo);

export default router;
