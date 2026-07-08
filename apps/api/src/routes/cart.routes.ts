import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const cartController = new CartController();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addToCart);
router.delete('/items/:productId', authenticate, cartController.removeFromCart);

export { router as cartRoutes };
