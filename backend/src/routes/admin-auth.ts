import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { createServiceLogger } from '../config/logger';
import { setOTP, getOTP, deleteOTP } from '../services/cache';
import { sendAdminOTPEmail } from '../services/email';
import { getEnv } from '../config/env';

const log = createServiceLogger('admin-auth');
const router = Router();

const ADMIN_EMAIL = getEnv().ADMIN_EMAIL || 'reproplanllc@gmail.com';

// Rate limiters
const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request OTP for admin login
router.post('/request-otp', requestOtpLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    
    // Validate email
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      log.warn({ email }, 'Non-admin email attempted to request admin OTP');
      res.status(403).json({ error: 'Access denied. This login is for administrators only.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 3-minute expiry (180 seconds)
    await setOTP(`admin:${email}`, otp, 180);
    
    // Send email
    await sendAdminOTPEmail(email, otp);
    
    log.info({ email }, 'Admin OTP sent successfully');
    res.json({ success: true, message: 'Login code sent to your email' });
  } catch (err) {
    log.error({ err }, 'Admin OTP request failed');
    res.status(500).json({ error: 'Failed to send login code. Please try again.' });
  }
});

// Verify OTP for admin login
router.post('/verify-otp', verifyOtpLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    
    // Validate inputs
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }

    // Validate email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      log.warn({ email }, 'Non-admin email attempted to verify admin OTP');
      res.status(403).json({ error: 'Access denied. This login is for administrators only.' });
      return;
    }

    // Retrieve stored OTP
    const stored = await getOTP(`admin:${email}`);
    
    if (!stored) {
      log.warn({ email }, 'Admin OTP not found or expired');
      res.status(401).json({ error: 'Invalid or expired login code' });
      return;
    }

    // Verify OTP
    if (stored !== otp) {
      log.warn({ email }, 'Invalid admin OTP attempted');
      res.status(401).json({ error: 'Invalid login code' });
      return;
    }

    // Delete OTP after successful verification (single use)
    await deleteOTP(`admin:${email}`);
    
    // Generate admin session token
    const token = uuidv4();
    
    log.info({ email }, 'Admin login successful');
    res.json({ 
      success: true, 
      token,
      message: 'Login successful' 
    });
  } catch (err) {
    log.error({ err }, 'Admin OTP verification failed');
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

export default router;
