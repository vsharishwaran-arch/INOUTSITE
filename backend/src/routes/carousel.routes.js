import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadCarouselImage, uploadCarouselVideo } from '../middleware/upload.js';
import {
  listCarouselItems,
  addProductToCarousel,
  addImageToCarousel,
  addVideoToCarousel,
  updateCarouselItem,
  deleteCarouselItem,
  reorderCarousel,
} from '../controllers/carousel.controller.js';

const router = Router();

// Public
router.get('/', asyncHandler(listCarouselItems));

// Admin
router.post('/product', authenticate, requireAdmin, asyncHandler(addProductToCarousel));
router.post('/image', authenticate, requireAdmin, uploadCarouselImage.single('image'), asyncHandler(addImageToCarousel));
router.post('/video', authenticate, requireAdmin, uploadCarouselVideo.single('video'), asyncHandler(addVideoToCarousel));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateCarouselItem));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteCarouselItem));
router.post('/reorder', authenticate, requireAdmin, asyncHandler(reorderCarousel));

export default router;
