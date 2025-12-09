import { Request, Response, NextFunction } from 'express';

// Lightweight audit logger for security-sensitive events
// Logs method, path, status, and requestId
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = (req as any).requestId || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const entry = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    // For production, send to a log aggregator. For now, console.log
    console.log('[AUDIT]', JSON.stringify(entry));
  });

  next();
};

