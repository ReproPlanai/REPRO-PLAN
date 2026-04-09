import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

const env = getEnv();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        type: 'user' | 'stakeholder';
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required. Invalid token format.' });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET!) as any;
    
    req.user = {
      id: decoded.id,
      type: decoded.type,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    logger.warn({ error: (error as Error).message, path: req.path }, 'Authentication failed');
    res.status(401).json({ error: 'Authentication failed. Invalid or expired token.' });
  }
};

/**
 * Authorization middleware - checks user role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role || '')) {
      logger.warn({ 
        userId: req.user.id, 
        role: req.user.role, 
        required: allowedRoles,
        path: req.path 
      }, 'Authorization failed - insufficient permissions');
      
      res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role 
      });
      return;
    }
    
    next();
  };
};

/**
 * Stakeholder-only middleware
 */
export const requireStakeholder = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.type !== 'stakeholder') {
    res.status(403).json({ error: 'Access denied. Stakeholder access required.' });
    return;
  }
  next();
};

/**
 * Admin-only middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.type !== 'stakeholder' || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Admin access required.' });
    return;
  }
  next();
};

/**
 * Optional authentication - sets user if token exists, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_SECRET!) as any;
      
      req.user = {
        id: decoded.id,
        type: decoded.type,
        role: decoded.role,
      };
    }
    
    next();
  } catch {
    // Token invalid but optional, continue without user
    next();
  }
};
