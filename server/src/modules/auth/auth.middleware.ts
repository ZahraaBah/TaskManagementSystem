import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extends Express Request to include authenticated user data.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

/**
 * Middleware to protect routes requiring authentication.
 * Verifies the JWT token from the Authorization header.
 *
 * @param req - Express request, expects header: Authorization: Bearer <token>
 * @param res - Express response
 * @param next - Express next function
 * @returns 401 if token is missing or invalid
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    (req as AuthenticatedRequest).user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
