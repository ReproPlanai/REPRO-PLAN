import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('health-records');
const router = Router();

// Get all health records (admin view)
router.get('/', async (req: Request, res: Response) => {
  try {
    const records = await query('SELECT * FROM health_records ORDER BY recorded_at DESC');
    res.json({ success: true, records });
  } catch (err) {
    log.error({ err }, 'Failed to get health records');
    res.status(500).json({ error: 'Failed to get health records' });
  }
});

// Create health record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, recordType, data } = req.body;
    
    if (!userId || !recordType) {
      res.status(400).json({ error: 'User ID and record type are required' });
      return;
    }
    
    const id = uuidv4();
    
    const record = await query(
      `INSERT INTO health_records (id, user_id, record_type, data, recorded_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       RETURNING *`,
      [id, userId, recordType, JSON.stringify(data || {})]
    );

    log.info({ recordId: id, userId, type: recordType }, 'Health record created');
    
    res.json({ success: true, record: record[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create health record');
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Get single health record
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await query('SELECT * FROM health_records WHERE id = $1', [req.params.id]);
    
    if (record.length === 0) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }
    res.json({ success: true, record: record[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get health record');
    res.status(500).json({ error: 'Failed to get health record' });
  }
});

// Delete health record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM health_records WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }
    
    log.info({ recordId: req.params.id }, 'Health record deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete health record');
    res.status(500).json({ error: 'Failed to delete health record' });
  }
});

export default router;
