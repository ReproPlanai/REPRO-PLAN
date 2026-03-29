import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { rehanaRespond } from '../services/ai';
import type { Message } from '../services/ai/types';

const log = createServiceLogger('rehana');
const router = Router();

const rehanaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', rehanaLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as { message?: string; history?: Message[] };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message required' });
      return;
    }

    const trimmed = message.trim().slice(0, 4000);
    if (!trimmed) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const response = await rehanaRespond(trimmed, history, { useCache: true });
    res.json({ response, assistant: 'Rehana' });
  } catch (err) {
    log.error({ err }, 'Rehana request failed');
    res.status(500).json({ error: 'Rehana is temporarily unavailable' });
  }
});

export default router;
