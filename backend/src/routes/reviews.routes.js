import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listReviews, listPublicReviews, approveReview, deleteReview, createReview, updateReview, adminCreateReview } from '../controllers/reviews.controller.js';
import { pool } from '../config/db.js';

const router = Router();

// DEBUG: Check if reviews table exists and show schema
router.get('/debug/schema', asyncHandler(async (req, res) => {
  try {
    const [columns] = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position
    `);
    
    const [count] = await pool.query('SELECT COUNT(*) as total FROM reviews');
    
    res.json({
      tableExists: columns.length > 0,
      columnCount: columns.length,
      columns: columns.map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable })),
      totalReviews: count[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}));

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
