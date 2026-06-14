// routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();
const ctrl = new AuthController();

router.post('/signup', authRateLimiter, ctrl.signup.bind(ctrl));
router.post('/login', authRateLimiter, ctrl.login.bind(ctrl));
router.post('/refresh', ctrl.refresh.bind(ctrl));
router.post('/logout', ctrl.logout.bind(ctrl));
router.get('/me', authenticate, ctrl.me.bind(ctrl));

export default router;
