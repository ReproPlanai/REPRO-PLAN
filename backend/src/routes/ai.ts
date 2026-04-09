import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { generateContent, getSupportedModels, isAIConfigured } from '../services/ai';
import { getCached, setCached } from '../services/cache';
import { randomUUID } from 'crypto';

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

// Get available models
router.get('/models', async (_req: Request, res: Response) => {
  try {
    const models = getSupportedModels();
    res.json({ 
      success: true, 
      models: models.map(model => ({
        id: model,
        name: model,
        description: getModelDescription(model)
      }))
    });
  } catch (err) {
    log.error({ err }, 'Failed to get models');
    res.status(500).json({ error: 'Failed to get models' });
  }
});

function getModelDescription(model: string): string {
  const descriptions: Record<string, string> = {
    'gemini-3-flash-preview': 'Gemini 3 Flash Preview - Fast, intelligent model for quick responses',
    'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview - SOTA reasoning model with coding capabilities',
    'gemini-3.1-flash-lite-preview': 'Gemini 3.1 Flash Lite Preview - Cost-efficient for high-volume tasks',
    'gemini-3.1-flash-image-preview': 'Gemini 3.1 Flash Image Preview - Visual intelligence with image generation',
    'gemini-3-pro-image-preview': 'Gemini 3 Pro Image Preview - State-of-the-art image generation',
    'gemini-pro-latest': 'Gemini Pro Latest - Alias to latest Pro model',
    'gemini-flash-latest': 'Gemini Flash Latest - Alias to latest Flash model (default)',
    'gemini-flash-lite-latest': 'Gemini Flash Lite Latest - Alias to latest Flash-Lite model',
    'imagen-4.0-generate-001': 'Imagen 4 - Latest image generation model',
    'imagen-4.0-ultra-generate-001': 'Imagen 4 Ultra - Ultra-high quality image generation'
  };
  return descriptions[model] || model;
}

router.post('/quiz-questions', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { topic = 'SRHR', difficulty = 'medium', count = 5, language = 'en', model } = req.body;
    const sessionId = randomUUID();

    const cacheKey = `ai:quiz:${topic}:${difficulty}:${count}:${model || 'default'}`;
    const cached = await getCached<{ questions: Array<Record<string, unknown>> }>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      log.warn('AI not configured, returning fallback quiz questions');
      const fallbackQuestions = [
        {
          id: '1',
          question: 'What does SRHR stand for?',
          options: ['Sexual and Reproductive Health and Rights', 'Standard Reproductive Health Resources', 'Social Rights and Health Reform', 'None of the above'],
          correctAnswer: 0,
          explanation: 'SRHR stands for Sexual and Reproductive Health and Rights, encompassing the right to make informed choices about one\'s body and health.',
          category: topic,
          difficulty: difficulty
        },
        {
          id: '2',
          question: 'Which of the following is a common method of contraception?',
          options: ['Vitamin C supplements', 'Condoms', 'Drinking water', 'Exercise'],
          correctAnswer: 1,
          explanation: 'Condoms are a common and effective method of contraception that also protect against sexually transmitted infections.',
          category: topic,
          difficulty: difficulty
        },
        {
          id: '3',
          question: 'What is consent?',
          options: ['Agreement to do something', 'Forced participation', 'Silence means yes', 'Only applies to women'],
          correctAnswer: 0,
          explanation: 'Consent is freely given, enthusiastic agreement to participate in any activity. It can be withdrawn at any time.',
          category: topic,
          difficulty: difficulty
        }
      ];
      const result = { questions: fallbackQuestions.slice(0, count) };
      await setCached(cacheKey, result, 86400);
      return res.json(result);
    }

    const prompt = `Generate ${count} SRHR quiz questions. Topic: ${topic}. Difficulty: ${difficulty}. Language: ${language}. ${QUIZ_SYSTEM_PROMPT}`;
    const raw = await generateContent(prompt, { maxTokens: 4000, model, taskType: 'quiz', sessionId });

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
    const { count = 3, theme = 'general', model } = req.body;
    const sessionId = randomUUID();

    const cacheKey = `ai:consent:${theme}:${count}:${model || 'default'}`;
    const cached = await getCached<{ scenarios: Array<Record<string, unknown>> }>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      log.warn('AI not configured, returning fallback consent scenarios');
      const fallbackScenarios = [
        {
          id: '1',
          situation: 'Your partner keeps asking you to send intimate photos even after you\'ve said no multiple times.',
          options: ['Send the photos to make them happy', 'Block them and tell a trusted adult', 'Ignore the messages', 'Send fake photos'],
          correctChoice: 1,
          explanation: 'Blocking someone who doesn\'t respect your boundaries is healthy. Telling a trusted adult can provide support and safety.'
        },
        {
          id: '2',
          situation: 'You\'re at a party and someone offers you a drink, but you\'re not sure what\'s in it.',
          options: ['Drink it anyway', 'Politely decline', 'Ask someone else to taste it first', 'Drink half and see how you feel'],
          correctChoice: 1,
          explanation: 'It\'s always okay to say no to something you\'re uncomfortable with. Your safety and boundaries matter.'
        },
        {
          id: '3',
          situation: 'A friend wants to share something personal with you but asks you not to tell anyone.',
          options: ['Immediately tell everyone', 'Respect their privacy and keep it confidential', 'Share it with just one close friend', 'Post it on social media'],
          correctChoice: 1,
          explanation: 'Respecting someone\'s privacy and consent about sharing their personal information is important for building trust.'
        }
      ];
      const result = { scenarios: fallbackScenarios.slice(0, count) };
      await setCached(cacheKey, result, 86400);
      return res.json(result);
    }

    const prompt = `Generate ${count} consent education scenarios. Theme: ${theme}. ${CONSENT_SYSTEM_PROMPT}`;
    const raw = await generateContent(prompt, { maxTokens: 3000, model, taskType: 'game', sessionId });

    let parsed: { scenarios?: Array<Record<string, unknown>> };
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      log.warn({ err, raw }, 'Failed to parse consent JSON, using fallback');
      // Return fallback scenarios if AI response fails to parse
      const fallbackScenarios = [
        {
          id: '1',
          situation: 'Your partner keeps asking you to send intimate photos even after you\'ve said no multiple times.',
          options: ['Send the photos to make them happy', 'Block them and tell a trusted adult', 'Ignore the messages', 'Send fake photos'],
          correctChoice: 1,
          explanation: 'Blocking someone who doesn\'t respect your boundaries is healthy. Telling a trusted adult can provide support and safety.'
        },
        {
          id: '2',
          situation: 'You\'re at a party and someone offers you a drink, but you\'re not sure what\'s in it.',
          options: ['Drink it anyway', 'Politely decline', 'Ask someone else to taste it first', 'Drink half and see how you feel'],
          correctChoice: 1,
          explanation: 'It\'s always okay to say no to something you\'re uncomfortable with. Your safety and boundaries matter.'
        },
        {
          id: '3',
          situation: 'A friend wants to share something personal with you but asks you not to tell anyone.',
          options: ['Immediately tell everyone', 'Respect their privacy and keep it confidential', 'Share it with just one close friend', 'Post it on social media'],
          correctChoice: 1,
          explanation: 'Respecting someone\'s privacy and consent about sharing their personal information is important for building trust.'
        }
      ];
      const result = { scenarios: fallbackScenarios.slice(0, count) };
      await setCached(cacheKey, result, 86400);
      return res.json(result);
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
    const { question, userAnswer, correctAnswer, context, model } = req.body;
    const sessionId = randomUUID();

    if (!question || userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: 'question, userAnswer, correctAnswer required' });
    }

    const prompt = `You are an SRHR educator. A youth answered a quiz question.
Question: ${question}
Their answer: ${userAnswer}
Correct answer: ${correctAnswer}
${context ? `Context: ${context}` : ''}
Provide a brief, supportive, personalized explanation (2-4 sentences) for why the answer was correct or incorrect. Be encouraging and educational.`;

    const explanation = await generateContent(prompt, { maxTokens: 300, model, taskType: 'explain', sessionId });
    res.json({ explanation: explanation.trim() });
  } catch (err) {
    log.error({ err }, 'Explain failed');
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Direct REST API endpoint matching curl example
router.post('/generate', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { contents, model } = req.body;
    const sessionId = randomUUID();

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'contents array is required' });
    }

    // Build prompt from contents array
    const prompt = contents.map((content: any) => {
      if (content.parts && Array.isArray(content.parts)) {
        return content.parts.map((part: any) => part.text).join('\n');
      }
      return '';
    }).join('\n');

    const response = await generateContent(prompt, { model, taskType: 'explain', sessionId });
    res.json({ 
      candidates: [{
        content: {
          parts: [{ text: response }]
        }
      }]
    });
  } catch (err) {
    log.error({ err }, 'Direct generate failed');
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
