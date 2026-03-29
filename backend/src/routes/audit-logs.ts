import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('audit-logs');
const router = Router();

// Get all audit logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, action, entityType, limit = '100' } = req.query;
    
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (action) {
      sql += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }
    
    if (entityType) {
      sql += ` AND entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const logs = await query(sql, params);
    res.json({ success: true, logs });
  } catch (err) {
    log.error({ err }, 'Failed to get audit logs');
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// Create audit log entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent } = req.body;
    
    const id = uuidv4();
    const auditLog = await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [id, userId, action, entityType, entityId, JSON.stringify(oldValue), JSON.stringify(newValue), ipAddress, userAgent]
    );
    
    res.json({ success: true, log: auditLog[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create audit log');
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Get audit log by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const auditLog = await query('SELECT * FROM audit_logs WHERE id = $1', [req.params.id]);
    
    if (auditLog.length === 0) {
      res.status(404).json({ error: 'Audit log not found' });
      return;
    }
    
    res.json({ success: true, log: auditLog[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get audit log');
    res.status(500).json({ error: 'Failed to get audit log' });
  }
});

// Get user activity summary
router.get('/summary/user/:userId', async (req: Request, res: Response) => {
  try {
    const summary = await query(
      `SELECT 
        action,
        COUNT(*) as count,
        MAX(created_at) as last_activity
       FROM audit_logs 
       WHERE user_id = $1 
       GROUP BY action 
       ORDER BY count DESC`,
      [req.params.userId]
    );
    
    res.json({ success: true, summary });
  } catch (err) {
    log.error({ err }, 'Failed to get user activity summary');
    res.status(500).json({ error: 'Failed to get user activity summary' });
  }
});

export default router;
