import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDashboardStats,
  getRevenueChart,
  getBestSellers,
  getOrdersByStatus,
} from '../controllers/analytics.controller.js';

const router = Router();

router.get('/stats', authenticate, requireAdmin, asyncHandler(getDashboardStats));
router.get('/revenue', authenticate, requireAdmin, asyncHandler(getRevenueChart));
router.get('/best-sellers', authenticate, requireAdmin, asyncHandler(getBestSellers));
router.get('/orders-by-status', authenticate, requireAdmin, asyncHandler(getOrdersByStatus));

export default router;
