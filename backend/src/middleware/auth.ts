import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const TOKEN_MAX_AGE_DAYS = 7;
const TOKEN_MAX_AGE_MS = TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export interface AuthPayload {
  id: number | string;
  role: string;
  type: 'user' | 'stakeholder';
}

export const signToken = (payload: AuthPayload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: `${TOKEN_MAX_AGE_DAYS}d` });
};

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration: JWT secret missing' });
    }

    const decoded = jwt.verify(token, secret) as any;

    // Enforce max age even if token has longer exp
    const issuedAtMs = (decoded.iat || 0) * 1000;
    if (Date.now() - issuedAtMs > TOKEN_MAX_AGE_MS) {
      return res.status(401).json({ success: false, message: 'Token expired, please sign in again' });
    }

    // Attach user context for downstream guards
    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type
    };

    // Hint client when to refresh (6 days)
    const refreshAfterMs = issuedAtMs + (TOKEN_MAX_AGE_MS - 24 * 60 * 60 * 1000);
    res.setHeader('x-token-refresh-after', new Date(refreshAfterMs).toISOString());

    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

