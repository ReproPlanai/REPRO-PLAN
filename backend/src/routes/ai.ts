import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { generateContent } from '../services/ai';
import { getCached, setCached } from '../services/cache';

const log = createServiceLogger('ai');
const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const QUIZ_SYSTEM_PROMPT = `You are an SRHR (Sexual and Reproductive Health and Rights) education expert creating quiz questions for youth in Africa.
Generate valid JSON only. No markdown, no code blocks. Format:
{"questions":[{"id":"1","question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","category":"...","difficulty":"easy|medium|hard"}]}
correctAnswer is 0-based index. Keep questions culturally appropriate and evidence-based.`;

const CONSENT_SYSTEM_PROMPT = `You are an SRHR educator creating consent education scenarios for youth in Africa.
Generate valid JSON only. No markdown, no code blocks. Format:
{"scenarios":[{"id":"1","situation":"...","options":["A","B","C"],"correctChoice":0,"explanation":"..."}]}
correctChoice is 0-based index. Focus on consent, boundaries, and healthy relationships.`;

router.post('/quiz-questions', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { topic = 'SRHR', difficulty = 'medium', count = 5, language = 'en' } = req.body;

    const cacheKey = `ai:quiz:${topic}:${difficulty}:${count}`;
    const cached = await getCached<{ questions: Array<Record<string, unknown>> }>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const prompt = `Generate ${count} SRHR quiz questions. Topic: ${topic}. Difficulty: ${difficulty}. Language: ${language}. ${QUIZ_SYSTEM_PROMPT}`;
    const raw = await generateContent(prompt, { maxTokens: 4000 });

    let parsed: { questions?: Array<Record<string, unknown>> };
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      log.warn({ raw }, 'Failed to parse quiz JSON');
      return res.status(500).json({ error: 'Failed to generate questions' });
    }

    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const result = { questions };
    await setCached(cacheKey, result, 86400);

    res.json(result);
  } catch (err) {
    log.error({ err }, 'Quiz questions failed');
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

router.post('/consent-scenarios', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { count = 3, theme = 'general' } = req.body;

    const cacheKey = `ai:consent:${theme}:${count}`;
    const cached = await getCached<{ scenarios: Array<Record<string, unknown>> }>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const prompt = `Generate ${count} consent education scenarios. Theme: ${theme}. ${CONSENT_SYSTEM_PROMPT}`;
    const raw = await generateContent(prompt, { maxTokens: 3000 });

    let parsed: { scenarios?: Array<Record<string, unknown>> };
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      log.warn({ raw }, 'Failed to parse consent JSON');
      return res.status(500).json({ error: 'Failed to generate scenarios' });
    }

    const scenarios = Array.isArray(parsed?.scenarios) ? parsed.scenarios : [];
    const result = { scenarios };
    await setCached(cacheKey, result, 86400);

    res.json(result);
  } catch (err) {
    log.error({ err }, 'Consent scenarios failed');
    res.status(500).json({ error: 'Failed to generate consent scenarios' });
  }
});

router.post('/explain', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, correctAnswer, context } = req.body;

    if (!question || userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: 'question, userAnswer, correctAnswer required' });
    }

    const prompt = `You are an SRHR educator. A youth answered a quiz question.
Question: ${question}
Their answer: ${userAnswer}
Correct answer: ${correctAnswer}
${context ? `Context: ${context}` : ''}
Provide a brief, supportive, personalized explanation (2-4 sentences) for why the answer was correct or incorrect. Be encouraging and educational.`;

    const explanation = await generateContent(prompt, { maxTokens: 300 });
    res.json({ explanation: explanation.trim() });
  } catch (err) {
    log.error({ err }, 'Explain failed');
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

export default router;
