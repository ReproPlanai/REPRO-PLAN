import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';

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

    // Transcription service removed as part of AI Gateway architecture cleanup
    // OpenAI Whisper is not part of the Gemini/Claude provider strategy
    log.warn('Transcription service disabled - OpenAI provider removed from AI Gateway');
    res.status(503).json({ error: 'Transcription service temporarily unavailable' });
  } catch (err) {
    log.error({ err }, 'Transcription failed');
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
