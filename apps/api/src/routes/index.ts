import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { cartRoutes } from './cart.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);

export { router as apiRoutes };
