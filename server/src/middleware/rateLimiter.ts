import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const createRateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs =
    options.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000');
  const max =
    options.max ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100');

  return rateLimit({
    windowMs,
    max,
    message: options.message ?? 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Fix: Prefix unused parameter with underscore
    skip: (_req: Request) => {
      return process.env.NODE_ENV === 'test';
    },
    // Fix: Replace 'any' with proper type
    keyGenerator: (req: Request): string => {
      const user = (req as { user?: { userId: string } }).user;
      return user?.userId ?? req.ip ?? 'unknown';
    },
  });
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
});
