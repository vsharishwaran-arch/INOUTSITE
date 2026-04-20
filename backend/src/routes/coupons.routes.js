import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupons.controller.js';

const router = Router();

// Public: validate coupon at checkout
router.post('/validate', asyncHandler(validateCoupon));

// Admin CRUD
router.get('/', authenticate, requireAdmin, asyncHandler(listCoupons));
router.get('/:id', authenticate, requireAdmin, asyncHandler(getCouponById));
router.post('/', authenticate, requireAdmin, asyncHandler(createCoupon));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateCoupon));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteCoupon));

export default router;
