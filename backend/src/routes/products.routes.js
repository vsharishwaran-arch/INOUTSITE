import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct, getCarouselProducts, toggleCarousel } from '../controllers/products.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Enhanced multer error handler with better logging
function handleMulterError(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        logger.error(`🔴 Multer error: ${err.message}`);
        logger.error(`🔴 Error code: ${err.code}`);
        logger.error(`🔴 Error: ${JSON.stringify(err)}`);
        
        // Add file info to request even if multer fails
        if (!req.files) req.files = [];
        
        // Continue to allow controller to handle it or return error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files' });
        }
        
        // For MIME type or other errors, continue
        logger.warn(`⚠️ Multer error but continuing: ${err.message}`);
      }
      
      logger.info(`📤 Multer completed. req.files: ${req.files ? req.files.length : 0} files`);
      next();
    });
  };
}

router.get('/', asyncHandler(listProducts));
router.get('/carousel', asyncHandler(getCarouselProducts));
router.get('/:id', asyncHandler(getProductById));

router.post('/', authenticate, requireAdmin, handleMulterError(uploadProductImages.array('images', 5)), asyncHandler(createProduct));
router.put('/:id', authenticate, requireAdmin, handleMulterError(uploadProductImages.array('images', 5)), asyncHandler(updateProduct));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteProduct));
router.patch('/:id/carousel', authenticate, requireAdmin, asyncHandler(toggleCarousel));

export default router;