import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrder, getOrderById, listOrders, updateOrderStatus, updatePaymentStatus, myOrders, bulkUpdateOrderStatus } from '../controllers/orders.controller.js';

const router = Router();

router.post('/', asyncHandler(createOrder));
router.get('/my-orders', asyncHandler(myOrders));
router.get('/', authenticate, requireAdmin, asyncHandler(listOrders));
router.get('/:id', asyncHandler(getOrderById));
router.patch('/bulk-status', authenticate, requireAdmin, asyncHandler(bulkUpdateOrderStatus));
router.patch('/:id/status', authenticate, requireAdmin, asyncHandler(updateOrderStatus));
router.patch('/:id/payment-status', authenticate, requireAdmin, asyncHandler(updatePaymentStatus));

export default router;