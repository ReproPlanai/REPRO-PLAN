import rateLimit from 'express-rate-limit';
import { logger } from '../config/logger';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn({ 
      ip: req.ip,
      path: req.path,
      limit: options.max 
    }, 'Rate limit exceeded');
    res.status(429).json(options.message);
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn({ 
      ip: req.ip,
      path: req.path,
      body: { ...req.body, secretCode: '[REDACTED]', password: '[REDACTED]' }
    }, 'Auth rate limit exceeded - possible brute force attack');
    res.status(429).json(options.message);
  }
});

/**
 * Strict rate limiter for admin endpoints
 * 30 requests per 15 minutes per IP
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit admin operations
  message: {
    error: 'Admin rate limit exceeded',
    message: 'Please slow down your admin operations',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn({ 
      ip: req.ip,
      user: (req as any).user?.id,
      path: req.path 
    }, 'Admin rate limit exceeded');
    res.status(429).json(options.message);
  }
});

/**
 * Create custom rate limiter
 */
export const createRateLimiter = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn({ 
        ip: req.ip,
        path: req.path,
        limit: maxRequests 
      }, 'Custom rate limit exceeded');
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: `${windowMinutes} minutes`
      });
    }
  });
};
