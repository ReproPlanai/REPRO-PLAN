import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const reqId = (req as Request & { reqId?: string }).reqId;
  logger.error({ err, reqId }, 'Request error');

  const status = (err as Error & { status?: number }).status ?? 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ error: message, reqId: reqId || undefined });
}
