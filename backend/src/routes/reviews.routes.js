import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listReviews, listPublicReviews, approveReview, deleteReview, createReview, updateReview, adminCreateReview } from '../controllers/reviews.controller.js';

const router = Router();

// Public: submit a review
router.post('/', asyncHandler(createReview));

// Public: get approved reviews for homepage
router.get('/public', asyncHandler(listPublicReviews));

// Admin: moderate reviews
router.get('/', authenticate, requireAdmin, asyncHandler(listReviews));
router.post('/admin', authenticate, requireAdmin, asyncHandler(adminCreateReview));
router.patch('/:id/approve', authenticate, requireAdmin, asyncHandler(approveReview));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateReview));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteReview));

export default router;
