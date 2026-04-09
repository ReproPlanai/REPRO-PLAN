import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('accessibility');
const router = Router();

// Default accessibility settings
const defaultSettings = {
  // Visual
  highContrast: false,
  largeText: false,
  screenReader: false,
  textSpacing: 'normal',
  colorBlindMode: 'none',
  
  // Motor
  keyboardNavigation: false,
  switchAccess: false,
  dwellClicking: false,
  
  // Cognitive
  simplifiedUI: false,
  readingGuide: false,
  focusMode: false,
  
  // Hearing
  visualAlerts: false,
  captionsEnabled: true,
  signLanguage: false,
  
  // Language
  preferredLanguage: 'en',
  signLanguagePreference: 'asl'
};

// Get user accessibility settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      // Return default settings for non-logged in users
      return res.json({ success: true, settings: defaultSettings });
    }
    
    const result = await query(
      'SELECT settings FROM accessibility_settings WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      // Return default settings if none saved
      return res.json({ success: true, settings: defaultSettings });
    }
    
    res.json({ success: true, settings: result[0].settings });
  } catch (err) {
    log.error({ err }, 'Failed to get accessibility settings');
    res.status(500).json({ error: 'Failed to get accessibility settings' });
  }
});

// Update accessibility settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const { userId, settings } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const id = uuidv4();
    const result = await query(
      `INSERT INTO accessibility_settings (id, user_id, settings, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
       settings = EXCLUDED.settings,
       updated_at = NOW()
       RETURNING *`,
      [id, userId, JSON.stringify(settings)]
    );
    
    log.info({ userId }, 'Accessibility settings updated');
    res.json({ success: true, settings: result[0].settings });
  } catch (err) {
    log.error({ err }, 'Failed to update accessibility settings');
    res.status(500).json({ error: 'Failed to update accessibility settings' });
  }
});

// Get all accessibility profiles
router.get('/profiles', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    
    let sql = 'SELECT * FROM accessibility_profiles WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND (user_id = $${paramIndex} OR is_public = true)`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ' AND is_public = true';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const profiles = await query(sql, params);
    res.json({ success: true, profiles });
  } catch (err) {
    log.error({ err }, 'Failed to get accessibility profiles');
    res.status(500).json({ error: 'Failed to get accessibility profiles' });
  }
});

// Create accessibility profile
router.post('/profiles', async (req: Request, res: Response) => {
  try {
    const { userId, name, description, settings, isPublic = false } = req.body;
    
    if (!name || !settings) {
      res.status(400).json({ error: 'Name and settings are required' });
      return;
    }
    
    const id = uuidv4();
    const profile = await query(
      `INSERT INTO accessibility_profiles 
       (id, user_id, name, description, settings, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, userId || null, name, description || '', JSON.stringify(settings), isPublic]
    );
    
    log.info({ profileId: id }, 'Accessibility profile created');
    res.json({ success: true, profile: profile[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create accessibility profile');
    res.status(500).json({ error: 'Failed to create accessibility profile' });
  }
});

// Delete accessibility profile
router.delete('/profiles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM accessibility_profiles WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    log.info({ profileId: id }, 'Accessibility profile deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete accessibility profile');
    res.status(500).json({ error: 'Failed to delete accessibility profile' });
  }
});

export default router;
