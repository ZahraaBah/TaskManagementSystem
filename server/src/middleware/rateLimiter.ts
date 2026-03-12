import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

const getClientIp = (req: Request): string => {
  const raw = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  // Normalize IPv4-mapped IPv6 addresses (::ffff:1.2.3.4 → 1.2.3.4)
  return raw.replace(/^::ffff:/, '');
};

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
    skip: () => process.env.NODE_ENV === 'test',
    keyGenerator: (req: Request): string => {
      if (process.env.NODE_ENV === 'test') return 'test-key';
      return getClientIp(req);
    },
    validate: { xForwardedForHeader: false },
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
