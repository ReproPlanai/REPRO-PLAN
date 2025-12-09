import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Attaches a request ID to each request for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] as string | undefined;
  const reqId = id && id.trim() ? id : randomUUID();

  // Attach to request and response for downstream logging
  (req as any).requestId = reqId;
  res.setHeader('x-request-id', reqId);

  next();
};

