import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('users');
const router = Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Try again later.' }
});

// Register new user
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { secretCode, demographics, phoneNumber } = req.body;
    
    if (!secretCode) {
      res.status(400).json({ error: 'Secret code is required' });
      return;
    }

    // Check if secret code already exists in database
    const existingUser = await query('SELECT id FROM users WHERE secret_code = $1', [secretCode.toUpperCase()]);
    if (existingUser.length > 0) {
      res.status(409).json({ error: 'Secret code already in use' });
      return;
    }

    const id = uuidv4();
    const surveyLink = `${process.env.SURVEY_BASE_URL || 'https://reproplanai.com/survey'}/${id}`;
    
    // Insert user into database
    await query(
      `INSERT INTO users (id, secret_code, survey_link, phone_number, is_verified, is_used, last_login, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
      [id, secretCode.toUpperCase(), surveyLink, phoneNumber, true, true]
    );

    // Insert demographics if provided
    if (demographics) {
      await query(
        `INSERT INTO user_demographics (id, user_id, age_range, gender, county, education_level, 
         relationship_status, primary_language, has_children, srhr_experience, disability_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [uuidv4(), id, demographics.ageRange, demographics.gender, demographics.county,
         demographics.education, demographics.relationshipStatus, demographics.primaryLanguage,
         demographics.hasChildren === 'yes', demographics.srhrExperience, demographics.disabilityStatus]
      );
    }

    log.info({ userId: id }, 'User registered');
    res.json({ success: true, user: { id, surveyLink }, surveyLink, secretCode });
  } catch (err) {
    log.error({ err }, 'User registration failed');
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { secretCode } = req.body;
    
    if (!secretCode) {
      res.status(400).json({ error: 'Secret code is required' });
      return;
    }

    // Find user by secret code
    let foundUser = await query('SELECT * FROM users WHERE secret_code = $1', [secretCode.toUpperCase()]);
    let user = foundUser[0];

    if (!user) {
      res.status(404).json({ error: 'Invalid secret code. Please check and try again.' });
      return;
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW(), is_used = true, updated_at = NOW() WHERE id = $1', [user.id]);

    const token = uuidv4();
    log.info({ userId: user.id }, 'User logged in');
    
    // Remove secret code from response
    const { secret_code, ...userWithoutCode } = user;
    
    res.json({
      success: true,
      user: userWithoutCode,
      token
    });
  } catch (err) {
    log.error({ err }, 'User login failed');
    res.status(500).json({ error: 'Login failed' });
  }
});

// Reset/forget code
router.post('/reset-code', authLimiter, async (req: Request, res: Response) => {
  try {
    const { surveyLink, newCode } = req.body;
    
    if (!surveyLink || !newCode) {
      res.status(400).json({ error: 'Survey link and new code are required' });
      return;
    }

    // Find user by survey link
    let foundUser = await query('SELECT * FROM users WHERE survey_link = $1', [surveyLink]);
    let user = foundUser[0];

    if (!user) {
      res.status(404).json({ error: 'Survey link not found. Please check your survey link and try again.' });
      return;
    }

    // Update secret code
    await query('UPDATE users SET secret_code = $1, last_login = NOW(), is_used = true, updated_at = NOW() WHERE id = $2',
      [newCode.toUpperCase(), user.id]);

    log.info({ userId: user.id }, 'User code reset');
    res.json({ success: true, secretCode: newCode, accountType: 'user' });
  } catch (err) {
    log.error({ err }, 'Code reset failed');
    res.status(500).json({ error: 'Code reset failed' });
  }
});

// Get all users (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await query('SELECT id, survey_link, phone_number, is_verified, is_used, last_login, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users });
  } catch (err) {
    log.error({ err }, 'Failed to get users');
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await query('SELECT id, survey_link, phone_number, is_verified, is_used, last_login, created_at, updated_at FROM users WHERE id = $1', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ success: true, user: user[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get user');
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, isVerified, demographics } = req.body;
    
    const user = await query(
      `UPDATE users SET phone_number = $1, is_verified = $2, updated_at = NOW()
       WHERE id = $3 RETURNING id, survey_link, phone_number, is_verified, is_used, last_login, created_at, updated_at`,
      [phoneNumber, isVerified, req.params.id]
    );
    
    if (user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update demographics if provided
    if (demographics) {
      await query(
        `INSERT INTO user_demographics (id, user_id, age_range, gender, county, education_level, 
         relationship_status, primary_language, has_children, srhr_experience, disability_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id) DO UPDATE SET
         age_range = EXCLUDED.age_range,
         gender = EXCLUDED.gender,
         county = EXCLUDED.county,
         education_level = EXCLUDED.education_level,
         relationship_status = EXCLUDED.relationship_status,
         primary_language = EXCLUDED.primary_language,
         has_children = EXCLUDED.has_children,
         srhr_experience = EXCLUDED.srhr_experience,
         disability_status = EXCLUDED.disability_status,
         updated_at = NOW()`,
        [uuidv4(), req.params.id, demographics.ageRange, demographics.gender, demographics.county,
         demographics.education, demographics.relationshipStatus, demographics.primaryLanguage,
         demographics.hasChildren === 'yes', demographics.srhrExperience, demographics.disabilityStatus]
      );
    }
    
    log.info({ userId: req.params.id }, 'User updated');
    res.json({ success: true, user: user[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update user');
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Delete related records first (cascade)
    await query('DELETE FROM user_demographics WHERE user_id = $1', [req.params.id]);
    await query('DELETE FROM health_records WHERE user_id = $1', [req.params.id]);
    await query('DELETE FROM chat_history WHERE user_id = $1', [req.params.id]);
    await query('DELETE FROM survey_responses WHERE user_id = $1', [req.params.id]);
    
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    log.info({ userId: req.params.id }, 'User deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete user');
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user health records
router.get('/:id/health-records', async (req: Request, res: Response) => {
  try {
    const user = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const records = await query('SELECT * FROM health_records WHERE user_id = $1 ORDER BY recorded_at DESC', [req.params.id]);
    res.json({ success: true, records });
  } catch (err) {
    log.error({ err }, 'Failed to get health records');
    res.status(500).json({ error: 'Failed to get health records' });
  }
});

// Tier 3 Authentication - Verify User
router.post('/verify', authLimiter, async (req: Request, res: Response) => {
  try {
    const { secretCode } = req.body;

    if (!secretCode) {
      res.status(400).json({ error: 'Secret code is required' });
      return;
    }

    // Find user by secret code
    const foundUser = await query('SELECT * FROM users WHERE secret_code = $1', [secretCode.toUpperCase()]);
    const user = foundUser[0];

    if (!user) {
      res.status(404).json({ error: 'Invalid secret code' });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({ error: 'User is not verified' });
      return;
    }

    // Generate verification token
    const token = uuidv4();
    const { secret_code, ...userWithoutCode } = user;

    log.info({ userId: user.id }, 'User verified via Tier 3 auth');
    res.json({ success: true, user: userWithoutCode, token });
  } catch (err) {
    log.error({ err }, 'User verification failed');
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
