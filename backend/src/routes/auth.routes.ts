import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupBody, loginBody } from '../validators/auth.schema';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/signup', authLimiter, validate({ body: signupBody }), authController.signup);
router.post('/login', authLimiter, validate({ body: loginBody }), authController.login);
router.post('/logout', authController.logout);
// Express 5 type compatibility - safe cast
router.get('/me', authenticate as any, authController.me);

export default router;
