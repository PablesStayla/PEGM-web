import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.post('/sign-out', authenticate, authController.signOut);
router.get('/me', authenticate, authController.getCurrentUser);

export { router as authRoutes };
