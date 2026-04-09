import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { setOTP, getOTP, deleteOTP } from '../services/cache';
import { sendOTPEmail } from '../services/email';

const log = createServiceLogger('auth');
const router = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/request-otp', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body as { email?: string; phone?: string };
    const identifier = email || phone;
    if (!identifier) {
      res.status(400).json({ error: 'Email or phone required' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await setOTP(identifier, otp);

    if (email) {
      await sendOTPEmail(email, otp);
      log.info({ email }, 'OTP sent');
    } else {
      log.info({ phone }, 'OTP generated (SMS not implemented)');
    }

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    log.error({ err }, 'OTP request failed');
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, phone, otp } = req.body as { email?: string; phone?: string; otp: string };
    const identifier = email || phone;
    if (!identifier || !otp) {
      res.status(400).json({ error: 'Email or phone and OTP required' });
      return;
    }

    const stored = await getOTP(identifier);
    if (!stored || stored !== otp) {
      res.status(401).json({ error: 'Invalid or expired OTP' });
      return;
    }

    await deleteOTP(identifier);
    const token = uuidv4();
    res.json({ success: true, token });
  } catch (err) {
    log.error({ err }, 'OTP verify failed');
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Verify auth token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    // In production, verify JWT token here
    // For now, return success with decoded user info
    res.json({ success: true, user: { id: 'user-id', role: 'USER' } });
  } catch (err) {
    log.error({ err }, 'Token verification failed');
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
