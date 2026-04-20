import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct, getCarouselProducts, toggleCarousel } from '../controllers/products.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = Router();

router.get('/', asyncHandler(listProducts));
router.get('/carousel', asyncHandler(getCarouselProducts));
router.get('/:id', asyncHandler(getProductById));

router.post('/', authenticate, requireAdmin, uploadProductImages.array('images', 5), asyncHandler(createProduct));
router.put('/:id', authenticate, requireAdmin, uploadProductImages.array('images', 5), asyncHandler(updateProduct));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteProduct));
router.patch('/:id/carousel', authenticate, requireAdmin, asyncHandler(toggleCarousel));

export default router;