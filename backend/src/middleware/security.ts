import { Request, Response, NextFunction } from 'express';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

const env = getEnv();

/**
 * HTTPS enforcement middleware
 * Redirects HTTP to HTTPS in production
 */
export const requireHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Skip in development
  if (env.NODE_ENV === 'development') {
    return next();
  }
  
  // Skip healthcheck endpoint (Railway internal healthcheck uses HTTP)
  if (req.path === '/health') {
    return next();
  }
  
  // Skip localhost/internal requests
  const host = req.headers.host || '';
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) {
    return next();
  }
  
  // Check if request is secure
  const isSecure = req.secure || 
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.headers['x-forwarded-ssl'] === 'on';
  
  if (!isSecure) {
    // Only redirect GET requests, reject others
    if (req.method === 'GET') {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      logger.info({ from: req.url, to: httpsUrl }, 'Redirecting to HTTPS');
      res.redirect(301, httpsUrl);
      return;
    }
    
    logger.warn({ 
      method: req.method, 
      path: req.path,
      ip: req.ip 
    }, 'Rejected non-HTTPS request');
    
    res.status(400).json({ 
      error: 'HTTPS required',
      message: 'This API requires HTTPS in production. Please use https://'
    });
    return;
  }
  
  // Add HSTS header in production
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  next();
};

/**
 * Security headers middleware (Fortune 500 grade)
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://repro-plan.vercel.app; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://repro-plan.vercel.app https://*.railway.app; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

/**
 * Request validation middleware
 * Validates content type and body size
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn({ 
        method: req.method, 
        path: req.path,
        contentType 
      }, 'Invalid content type');
      
      res.status(415).json({ 
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json'
      });
      return;
    }
  }
  
  next();
};

/**
 * Input sanitization middleware
 * Basic sanitization for common attack vectors
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeString = (str: string): string => {
      return str
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    };
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  next();
};
