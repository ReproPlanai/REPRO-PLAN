import rateLimit from 'express-rate-limit';

// General API limiter (already applied globally in server.ts, but available per-route)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth attempts, please try again later.',
  trustProxy: true // align with app trust proxy (DigitalOcean LB)
});

// Stricter limiter for password/code recovery endpoints
export const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many recovery attempts, please try again later.',
  trustProxy: true // align with app trust proxy (DigitalOcean LB)
});

