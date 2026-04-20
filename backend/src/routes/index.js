import { Router } from 'express';
import cartRoutes from './cart.routes.js';
import ordersRoutes from './orders.routes.js';
import paymentsRoutes from './payments.routes.js';
import productsRoutes from './products.routes.js';
import usersRoutes from './users.routes.js';
import couponsRoutes from './coupons.routes.js';
import customersRoutes from './customers.routes.js';
import analyticsRoutes from './analytics.routes.js';
import reviewsRoutes from './reviews.routes.js';
import contentRoutes from './content.routes.js';
import videosRoutes from './videos.routes.js';
import carouselRoutes from './carousel.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/users', usersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/orders', ordersRoutes);
router.use('/coupons', couponsRoutes);
router.use('/customers', customersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/content', contentRoutes);
router.use('/videos', videosRoutes);
router.use('/carousel', carouselRoutes);

export default router;