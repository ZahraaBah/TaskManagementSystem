import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';

/**
 * Handles user registration.
 * Validates request body with Zod before passing to service.
 *
 * @param req - Express request with email and password in body
 * @param res - Express response
 * @returns 201 with AuthResponseDto or 400/409/500 on error
 */
export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Error && error.message === 'Email already in use') {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handles user login.
 * Validates request body with Zod before passing to service.
 *
 * @param req - Express request with email and password in body
 * @param res - Express response
 * @returns 200 with AuthResponseDto or 400/401/500 on error
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await authService.login(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
