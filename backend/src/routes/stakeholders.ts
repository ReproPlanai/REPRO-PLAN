import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('stakeholders');
const router = Router();

const defaultPermissions: Record<string, string[]> = {
  ADMIN: ['system_access', 'user_management', 'analytics', 'content_management'],
  POLICE: ['emergency_alerts', 'case_management', 'location_access', 'reports'],
  SAFEHOUSE: ['resident_management', 'access_control', 'security_alerts', 'resources'],
  MEDICAL: ['patient_records', 'appointments', 'medical_resources', 'health_analytics'],
  NGO: ['program_management', 'community_outreach', 'resource_distribution', 'impact_tracking']
};

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Try again later.' }
});

// Register stakeholder
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { role, phoneNumber, surveyLink, name, organization, email } = req.body;
    
    if (!role || !phoneNumber) {
      res.status(400).json({ error: 'Role and phone number are required' });
      return;
    }

    // Check if phone number already exists for this role
    const existing = await query('SELECT id FROM stakeholders WHERE phone_number = $1 AND role = $2', 
      [phoneNumber, role.toUpperCase()]);
    if (existing.length > 0) {
      res.status(409).json({ error: 'Phone number already registered for this role' });
      return;
    }

    const id = uuidv4();
    const permissions = defaultPermissions[role.toUpperCase()] || [];
    
    const stakeholder = await query(
      `INSERT INTO stakeholders (id, role, phone_number, name, organization, email, survey_link, permissions, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, role.toUpperCase(), phoneNumber, name, organization, email, surveyLink, JSON.stringify(permissions), true]
    );

    log.info({ stakeholderId: id, role }, 'Stakeholder registered');
    res.json({ success: true, stakeholder: stakeholder[0] });
  } catch (err) {
    log.error({ err }, 'Stakeholder registration failed');
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login stakeholder
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { secretCode, phoneNumber, role } = req.body;
    
    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    // Find stakeholder
    let sql = 'SELECT * FROM stakeholders WHERE phone_number = $1';
    const params: any[] = [phoneNumber];
    if (role) {
      sql += ' AND role = $2';
      params.push(role.toUpperCase());
    }
    
    let foundStakeholder = await query(sql, params);
    let stakeholder = foundStakeholder[0];

    if (!stakeholder) {
      res.status(404).json({ error: 'Stakeholder not found. Please contact your administrator.' });
      return;
    }

    // Update last activity
    await query('UPDATE stakeholders SET last_login = NOW(), updated_at = NOW() WHERE id = $1', [stakeholder.id]);

    const token = uuidv4();
    log.info({ stakeholderId: stakeholder.id, role: stakeholder.role }, 'Stakeholder logged in');
    
    res.json({
      success: true,
      stakeholder,
      token
    });
  } catch (err) {
    log.error({ err }, 'Stakeholder login failed');
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all stakeholders
router.get('/', async (req: Request, res: Response) => {
  try {
    const stakeholders = await query('SELECT * FROM stakeholders ORDER BY created_at DESC');
    res.json({ success: true, stakeholders });
  } catch (err) {
    log.error({ err }, 'Failed to get stakeholders');
    res.status(500).json({ error: 'Failed to get stakeholders' });
  }
});

// Get single stakeholder
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stakeholder = await query('SELECT * FROM stakeholders WHERE id = $1', [req.params.id]);
    if (stakeholder.length === 0) {
      res.status(404).json({ error: 'Stakeholder not found' });
      return;
    }
    res.json({ success: true, stakeholder: stakeholder[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get stakeholder');
    res.status(500).json({ error: 'Failed to get stakeholder' });
  }
});

// Update stakeholder
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, organization, email, isActive, permissions } = req.body;
    
    const stakeholder = await query(
      `UPDATE stakeholders SET name = $1, organization = $2, email = $3, is_active = $4, permissions = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, organization, email, isActive, JSON.stringify(permissions), req.params.id]
    );
    
    if (stakeholder.length === 0) {
      res.status(404).json({ error: 'Stakeholder not found' });
      return;
    }

    log.info({ stakeholderId: req.params.id }, 'Stakeholder updated');
    res.json({ success: true, stakeholder: stakeholder[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update stakeholder');
    res.status(500).json({ error: 'Failed to update stakeholder' });
  }
});

// Delete stakeholder
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM stakeholders WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Stakeholder not found' });
      return;
    }

    log.info({ stakeholderId: req.params.id }, 'Stakeholder deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete stakeholder');
    res.status(500).json({ error: 'Failed to delete stakeholder' });
  }
});

// Tier 3 Authentication - Verify Stakeholder
router.post('/verify', authLimiter, async (req: Request, res: Response) => {
  try {
    const { secretCode, phoneNumber, role } = req.body;

    if (!phoneNumber || !role) {
      res.status(400).json({ error: 'Phone number and role are required' });
      return;
    }

    // Find stakeholder
    const foundStakeholder = await query(
      'SELECT * FROM stakeholders WHERE phone_number = $1 AND role = $2',
      [phoneNumber, role.toUpperCase()]
    );
    const stakeholder = foundStakeholder[0];

    if (!stakeholder) {
      res.status(404).json({ error: 'Stakeholder not found' });
      return;
    }

    if (!stakeholder.is_active) {
      res.status(403).json({ error: 'Stakeholder account is not active' });
      return;
    }

    // Generate verification token
    const token = uuidv4();

    log.info({ stakeholderId: stakeholder.id, role }, 'Stakeholder verified via Tier 3 auth');
    res.json({ success: true, stakeholder, token });
  } catch (err) {
    log.error({ err }, 'Stakeholder verification failed');
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
export { defaultPermissions };
