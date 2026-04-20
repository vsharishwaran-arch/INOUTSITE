import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listCustomers, getCustomerOrders } from '../controllers/customers.controller.js';

const router = Router();

router.get('/', authenticate, requireAdmin, asyncHandler(listCustomers));
router.get('/:email/orders', authenticate, requireAdmin, asyncHandler(getCustomerOrders));

export default router;
