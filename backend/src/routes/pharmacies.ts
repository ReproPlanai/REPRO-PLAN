import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('pharmacies');
const router = Router();

// Get all pharmacies with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { location, deliveryAvailable, search } = req.query;
    
    let sql = 'SELECT * FROM pharmacies WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (location) {
      sql += ` AND (city ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR region ILIKE $${paramIndex})`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    if (deliveryAvailable === 'true') {
      sql += ` AND delivery_available = true`;
    }
    
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ' ORDER BY name ASC';
    
    const pharmacies = await query(sql, params);
    res.json({ success: true, pharmacies });
  } catch (err) {
    log.error({ err }, 'Failed to get pharmacies');
    res.status(500).json({ error: 'Failed to get pharmacies' });
  }
});

// Get single pharmacy
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const pharmacies = await query('SELECT * FROM pharmacies WHERE id = $1', [id]);
    if (pharmacies.length === 0) {
      res.status(404).json({ error: 'Pharmacy not found' });
      return;
    }
    
    // Get pharmacy products
    const products = await query(
      'SELECT * FROM products WHERE pharmacy_id = $1 AND is_active = true',
      [id]
    );
    
    res.json({ success: true, pharmacy: pharmacies[0], products });
  } catch (err) {
    log.error({ err }, 'Failed to get pharmacy');
    res.status(500).json({ error: 'Failed to get pharmacy' });
  }
});

// Create pharmacy (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      city,
      region,
      phone,
      email,
      hours,
      deliveryAvailable,
      deliveryFee,
      coordinates
    } = req.body;
    
    if (!name || !address) {
      res.status(400).json({ error: 'Name and address are required' });
      return;
    }
    
    const id = uuidv4();
    const pharmacy = await query(
      `INSERT INTO pharmacies 
       (id, name, address, city, region, phone, email, hours, delivery_available, 
        delivery_fee, coordinates, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
       RETURNING *`,
      [id, name, address, city || '', region || '', phone || '', email || '', 
       hours || '', deliveryAvailable || false, deliveryFee || 0, 
       coordinates ? JSON.stringify(coordinates) : null]
    );
    
    log.info({ pharmacyId: id }, 'Pharmacy created');
    res.json({ success: true, pharmacy: pharmacy[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create pharmacy');
    res.status(500).json({ error: 'Failed to create pharmacy' });
  }
});

// Update pharmacy
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'address', 'city', 'region', 'phone', 'email', 'hours',
      'delivery_available', 'delivery_fee', 'coordinates', 'is_active'
    ];
    
    const setClauses: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(key === 'coordinates' && value ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }
    
    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    
    setClauses.push('updated_at = NOW()');
    
    const pharmacy = await query(
      `UPDATE pharmacies SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    
    if (pharmacy.length === 0) {
      res.status(404).json({ error: 'Pharmacy not found' });
      return;
    }
    
    log.info({ pharmacyId: id }, 'Pharmacy updated');
    res.json({ success: true, pharmacy: pharmacy[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update pharmacy');
    res.status(500).json({ error: 'Failed to update pharmacy' });
  }
});

// Delete pharmacy
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM pharmacies WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Pharmacy not found' });
      return;
    }
    
    log.info({ pharmacyId: id }, 'Pharmacy deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete pharmacy');
    res.status(500).json({ error: 'Failed to delete pharmacy' });
  }
});

export default router;
