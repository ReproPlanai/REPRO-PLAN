import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';
import { GHANA_CLINICS, GHANA_EMERGENCY_NUMBERS } from '../data/ghana-clinics';

const log = createServiceLogger('clinics');
const router = Router();

// Get all clinics
router.get('/', async (req: Request, res: Response) => {
  try {
    const clinics = await query('SELECT * FROM clinics ORDER BY created_at DESC');
    res.json({ success: true, clinics });
  } catch (err) {
    log.error({ err }, 'Failed to get clinics');
    res.status(500).json({ error: 'Failed to get clinics' });
  }
});

// Create clinic (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, address, phone, hours, services, coordinates, type } = req.body;
    
    if (!name || !address) {
      res.status(400).json({ error: 'Name and address are required' });
      return;
    }
    
    const id = uuidv4();
    const clinic = await query(
      `INSERT INTO clinics (id, name, address, phone, hours, services, latitude, longitude, type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [id, name, address, phone, hours, JSON.stringify(services || []), coordinates?.lat || null, coordinates?.lng || null, type, true]
    );

    log.info({ clinicId: id }, 'Clinic created');
    
    res.json({ success: true, clinic: clinic[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create clinic');
    res.status(500).json({ error: 'Failed to create clinic' });
  }
});

// Get single clinic
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const clinic = await query('SELECT * FROM clinics WHERE id = $1', [req.params.id]);
    if (clinic.length === 0) {
      res.status(404).json({ error: 'Clinic not found' });
      return;
    }
    res.json({ success: true, clinic: clinic[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get clinic');
    res.status(500).json({ error: 'Failed to get clinic' });
  }
});

// Update clinic
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, address, phone, hours, services, coordinates, type, isActive } = req.body;
    
    const clinic = await query(
      `UPDATE clinics SET name = $1, address = $2, phone = $3, hours = $4, services = $5, 
       latitude = $6, longitude = $7, type = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, address, phone, hours, JSON.stringify(services || []), coordinates?.lat || null, coordinates?.lng || null, type, isActive, req.params.id]
    );
    
    if (clinic.length === 0) {
      res.status(404).json({ error: 'Clinic not found' });
      return;
    }

    log.info({ clinicId: req.params.id }, 'Clinic updated');
    res.json({ success: true, clinic: clinic[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update clinic');
    res.status(500).json({ error: 'Failed to update clinic' });
  }
});

// Delete clinic
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM clinics WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) {
      res.status(404).json({ error: 'Clinic not found' });
      return;
    }
    log.info({ clinicId: req.params.id }, 'Clinic deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete clinic');
    res.status(500).json({ error: 'Failed to delete clinic' });
  }
});

// Get Ghana clinics data (pre-loaded data for Mapbox)
router.get('/ghana', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, clinics: GHANA_CLINICS });
  } catch (err) {
    log.error({ err }, 'Failed to get Ghana clinics');
    res.status(500).json({ error: 'Failed to get Ghana clinics' });
  }
});

// Get Ghana emergency numbers
router.get('/ghana/emergency', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, emergencyNumbers: GHANA_EMERGENCY_NUMBERS });
  } catch (err) {
    log.error({ err }, 'Failed to get emergency numbers');
    res.status(500).json({ error: 'Failed to get emergency numbers' });
  }
});

export default router;
