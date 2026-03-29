import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('notifications');
const router = Router();

// Get notifications for user/stakeholder
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, isRead, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (stakeholderId) {
      sql += ` AND stakeholder_id = $${paramIndex}`;
      params.push(stakeholderId);
      paramIndex++;
    }
    
    if (isRead !== undefined) {
      sql += ` AND is_read = $${paramIndex}`;
      params.push(isRead === 'true');
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const notifications = await query(sql, params);
    res.json({ success: true, notifications });
  } catch (err) {
    log.error({ err }, 'Failed to get notifications');
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Create notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, title, message, type, priority = 'normal', actionUrl, actionType } = req.body;
    
    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }
    
    const id = uuidv4();
    const notification = await query(
      `INSERT INTO notifications (id, user_id, stakeholder_id, title, message, type, priority, is_read, action_url, action_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [id, userId, stakeholderId, title, message, type, priority, false, actionUrl, actionType]
    );
    
    log.info({ notificationId: id, userId, stakeholderId, type }, 'Notification created');
    res.json({ success: true, notification: notification[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create notification');
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await query(
      'UPDATE notifications SET is_read = true, read_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (notification.length === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.json({ success: true, notification: notification[0] });
  } catch (err) {
    log.error({ err }, 'Failed to mark notification as read');
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for user
router.put('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    if (!userId && !stakeholderId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    let sql = 'UPDATE notifications SET is_read = true, read_at = NOW(), updated_at = NOW() WHERE is_read = false';
    const params: any[] = [];
    
    if (userId) {
      sql += ' AND user_id = $1';
      params.push(userId);
    } else if (stakeholderId) {
      sql += ' AND stakeholder_id = $1';
      params.push(stakeholderId);
    }
    
    const result = await query(sql, params);
    
    res.json({ success: true, updated: result.length });
  } catch (err) {
    log.error({ err }, 'Failed to mark all notifications as read');
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete notification');
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get unread count
router.get('/count/unread', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.query;
    
    let sql = 'SELECT COUNT(*) as count FROM notifications WHERE is_read = false';
    const params: any[] = [];
    
    if (userId) {
      sql += ' AND user_id = $1';
      params.push(userId);
    } else if (stakeholderId) {
      sql += ' AND stakeholder_id = $1';
      params.push(stakeholderId);
    }
    
    const count = await query(sql, params);
    res.json({ success: true, count: parseInt(count[0].count) });
  } catch (err) {
    log.error({ err }, 'Failed to get unread count');
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
