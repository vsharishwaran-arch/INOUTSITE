import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createIntent } from '../controllers/payments.controller.js';

const router = Router();

router.post('/intent', asyncHandler(createIntent));

export default router;