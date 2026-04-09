import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { reprobotRespond } from '../services/ai';
import type { Message } from '../services/ai/types';
import { randomUUID } from 'crypto';

const log = createServiceLogger('reprobot');
const router = Router();

const reprobotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', reprobotLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, model } = req.body as { message?: string; history?: Message[]; model?: string };
    const sessionId = randomUUID();

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message required' });
      return;
    }

    const trimmed = message.trim().slice(0, 4000);
    if (!trimmed) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const response = await reprobotRespond(trimmed, history, { useCache: true, model, taskType: 'chat', sessionId });
    res.json({ response, assistant: 'ReproBot' });
  } catch (err) {
    log.error({ err }, 'ReproBot request failed');
    res.status(500).json({ error: 'ReproBot is temporarily unavailable' });
  }
});

export default router;
