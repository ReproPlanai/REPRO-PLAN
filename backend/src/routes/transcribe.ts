import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import OpenAI, { toFile } from 'openai';
import { createServiceLogger } from '../config/logger';
import { getEnv } from '../config/env';

const log = createServiceLogger('transcribe');
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/ogg'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format'));
    }
  },
});

const transcribeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many transcription requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', transcribeLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      res.status(400).json({ error: 'Audio file required' });
      return;
    }

    const env = getEnv();
    if (!env.OPENAI_API_KEY) {
      log.warn('Transcribe requested but OPENAI_API_KEY not configured');
      res.status(503).json({ error: 'Transcription service unavailable' });
      return;
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const audioFile = await toFile(file.buffer, file.originalname || 'audio.webm', {
      type: file.mimetype,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    res.json({ transcript: transcription.text || '' });
  } catch (err) {
    log.error({ err }, 'Transcription failed');
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
