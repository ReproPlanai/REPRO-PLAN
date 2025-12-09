import { Request, Response, NextFunction } from 'express';

// Simple role guard: expects role in request (e.g., decoded token or header)
// In a real implementation, you would decode a JWT or session and attach req.user/req.stakeholder
export const roleGuard = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role =
      (req as any).user?.role ||
      (req as any).stakeholder?.role ||
      (req.headers['x-role'] as string | undefined);

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions'
      });
    }

    next();
  };
};

