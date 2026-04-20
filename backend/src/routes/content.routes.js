import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadContentImage } from '../middleware/upload.js';
import {
  getAllContent,
  getSectionContent,
  updateSectionContent,
  handleContentImageUpload,
  deleteContentImage,
} from '../controllers/content.controller.js';

const router = Router();

// ── Public (read) ─────────────────────────────────────────────────────────
router.get('/', getAllContent);
router.get('/:section', getSectionContent);

// ── Admin only (write) ────────────────────────────────────────────────────
router.put('/:section', authenticate, requireAdmin, updateSectionContent);
router.post('/upload/image', authenticate, requireAdmin, uploadContentImage.single('image'), handleContentImageUpload);
router.delete('/upload/image', authenticate, requireAdmin, deleteContentImage);

export default router;
