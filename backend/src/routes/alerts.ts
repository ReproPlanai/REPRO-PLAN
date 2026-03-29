import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('alerts');
const router = Router();

// Get all alerts with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, stakeholderId, status, priority } = req.query;
    
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (role) {
      sql += ` AND (assigned_role = $${paramIndex} OR assigned_role IS NULL)`;
      params.push(role);
      paramIndex++;
    }
    
    if (stakeholderId) {
      sql += ` AND (stakeholder_id = $${paramIndex} OR user_id = $${paramIndex})`;
      params.push(stakeholderId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      sql += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const alertList = await query(sql, params);
    res.json({ success: true, alerts: alertList });
  } catch (err) {
    log.error({ err }, 'Failed to get alerts');
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Create alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { alertType, priority, description, location, userId, stakeholderId, assignedRole } = req.body;
    
    const id = uuidv4();
    
    const alert = await query(
      `INSERT INTO alerts (id, alert_type, priority, status, description, location, user_id, stakeholder_id, assigned_role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, alertType, priority || 'medium', 'active', description, JSON.stringify(location || {}), userId, stakeholderId, assignedRole]
    );

    log.info({ alertId: id, type: alertType }, 'Alert created');
    
    res.json({ success: true, alert: alert[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create alert');
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Get single alert
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const alert = await query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (alert.length === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json({ success: true, alert: alert[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get alert');
    res.status(500).json({ error: 'Failed to get alert' });
  }
});

// Update alert
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, description, priority } = req.body;
    
    // Calculate response time if resolved
    let responseTime = null;
    if (status === 'resolved') {
      const existing = await query('SELECT created_at FROM alerts WHERE id = $1', [req.params.id]);
      if (existing.length > 0) {
        responseTime = Math.max(1, Math.round((Date.now() - new Date(existing[0].created_at).getTime()) / 60000));
      }
    }
    
    const alert = await query(
      `UPDATE alerts SET status = $1, description = $2, priority = $3, response_time = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status, description, priority, responseTime, req.params.id]
    );
    
    if (alert.length === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    log.info({ alertId: req.params.id }, 'Alert updated');
    res.json({ success: true, alert: alert[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update alert');
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM alerts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    log.info({ alertId: req.params.id }, 'Alert deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete alert');
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
