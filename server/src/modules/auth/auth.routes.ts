import { Router } from 'express';
import { registerController, loginController } from './auth.controller';

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerController);

/**
 * @route   POST /auth/login
 * @desc    Login and receive JWT token
 * @access  Public
 */
router.post('/login', loginController);

export default router;