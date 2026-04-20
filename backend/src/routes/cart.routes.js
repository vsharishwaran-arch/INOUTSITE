import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addCartItem, clearCart, deleteCartItem, getCart, updateCartItem } from '../controllers/cart.controller.js';

const router = Router();

router.get('/:cartId', asyncHandler(getCart));
router.post('/:cartId/items', asyncHandler(addCartItem));
router.patch('/:cartId/items/:productId/:size', asyncHandler(updateCartItem));
router.delete('/:cartId/items/:productId/:size', asyncHandler(deleteCartItem));
router.delete('/:cartId', asyncHandler(clearCart));

export default router;