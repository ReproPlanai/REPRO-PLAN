import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('messages');
const router = Router();

// Get all messages with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { toRole, toStakeholderId, isRead } = req.query;
    
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (toRole) {
      sql += ` AND to_role = $${paramIndex}`;
      params.push(toRole);
      paramIndex++;
    }
    
    if (toStakeholderId !== undefined) {
      sql += ` AND to_stakeholder_id = $${paramIndex}`;
      params.push(toStakeholderId);
      paramIndex++;
    }
    
    if (isRead !== undefined) {
      sql += ` AND is_read = $${paramIndex}`;
      params.push(isRead === 'true');
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const messageList = await query(sql, params);
    res.json({ success: true, messages: messageList });
  } catch (err) {
    log.error({ err }, 'Failed to get messages');
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Create message
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fromRole, fromStakeholderId, toRole, toStakeholderId, messageType, subject, content, priority, relatedCaseId, relatedAlertId } = req.body;
    
    const id = uuidv4();
    
    const message = await query(
      `INSERT INTO messages (id, from_role, from_stakeholder_id, to_role, to_stakeholder_id, message_type, subject, content, priority, is_read, related_case_id, related_alert_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [id, fromRole, fromStakeholderId, toRole, toStakeholderId, messageType, subject, content, priority, false, relatedCaseId, relatedAlertId]
    );

    log.info({ messageId: id, from: fromRole, to: toRole }, 'Message sent');
    
    res.json({ success: true, message: message[0] });
  } catch (err) {
    log.error({ err }, 'Failed to send message');
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get single message
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const message = await query('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    if (message.length === 0) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ success: true, message: message[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get message');
    res.status(500).json({ error: 'Failed to get message' });
  }
});

// Mark message as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const message = await query(
      'UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (message.length === 0) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    log.info({ messageId: req.params.id }, 'Message marked as read');
    res.json({ success: true, message: message[0] });
  } catch (err) {
    log.error({ err }, 'Failed to mark message as read');
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM messages WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    log.info({ messageId: req.params.id }, 'Message deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete message');
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
