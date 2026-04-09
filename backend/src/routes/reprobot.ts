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
    const { message, history, model, reproBotType } = req.body as { message?: string; history?: Message[]; model?: string; reproBotType?: { focus: string; tone: string; mode: string } };
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

    // Customize system prompt based on user preferences
    let customSystemPrompt: string | undefined;
    if (reproBotType) {
      const focusMap: Record<string, string> = {
        general: 'general sexual and reproductive health',
        contraception: 'contraception and birth control methods',
        relationships: 'healthy relationships and consent',
        emergency: 'emergency support and crisis resources',
        youth: 'youth-friendly sexual health information'
      };
      
      const toneMap: Record<string, string> = {
        clinical: 'clinical, professional, and medically accurate',
        friendly: 'friendly, approachable, and supportive',
        youthFriendly: 'youth-friendly, relatable, and non-judgmental',
        crisis: 'calm, reassuring, and focused on immediate support'
      };
      
      const modeMap: Record<string, string> = {
        text: 'clear text-only explanations',
        voice: 'conversational responses suitable for voice interaction',
        quick: 'concise, direct answers',
        detailed: 'comprehensive, detailed explanations'
      };
      
      const focus = focusMap[reproBotType.focus] || focusMap.general;
      const tone = toneMap[reproBotType.tone] || toneMap.friendly;
      const mode = modeMap[reproBotType.mode] || modeMap.text;
      
      customSystemPrompt = `You are ReproBot, a confidential AI assistant for sexual and reproductive health. Your responses should be ${tone} and provide ${mode}. Focus on ${focus}. Always prioritize user safety and provide accurate, evidence-based information. If the user indicates immediate danger or crisis, provide emergency resources.`;
    }

    const response = await reprobotRespond(trimmed, history, { useCache: true, model, taskType: 'chat', sessionId, systemPrompt: customSystemPrompt });
    res.json({ response, assistant: 'ReproBot' });
  } catch (err) {
    log.error({ err }, 'ReproBot request failed');
    res.status(500).json({ error: 'ReproBot is temporarily unavailable' });
  }
});

export default router;
