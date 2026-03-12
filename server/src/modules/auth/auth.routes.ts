import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from './auth.controller';
import { authenticate } from './auth.middleware';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.post('/logout', authenticate, logoutController); // ← L'ordre est important!

export default router;
