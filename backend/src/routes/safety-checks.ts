import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('safety-checks');
const router = Router();

// Get safety check history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { userId, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM safety_checks WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const checks = await query(sql, params);
    res.json({ success: true, checks });
  } catch (err) {
    log.error({ err }, 'Failed to get safety check history');
    res.status(500).json({ error: 'Failed to get safety check history' });
  }
});

// Submit safety check
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      mood, 
      safetyLevel, 
      needsHelp, 
      location, 
      notes, 
      alertContacts = false,
      contactIds = []
    } = req.body;
    
    if (!mood || !safetyLevel) {
      res.status(400).json({ error: 'Mood and safety level are required' });
      return;
    }
    
    const id = uuidv4();
    const safetyCheck = await query(
      `INSERT INTO safety_checks (
        id, user_id, mood, safety_level, needs_help, location, notes, 
        alert_contacts, contact_ids, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        id, userId, mood, safetyLevel, needsHelp, 
        location ? JSON.stringify(location) : null, 
        notes, alertContacts, JSON.stringify(contactIds), 
        needsHelp ? 'alert_triggered' : 'completed'
      ]
    );
    
    // If needs help and alert contacts enabled, create alert
    if (needsHelp && alertContacts && contactIds.length > 0) {
      for (const contactId of contactIds) {
        await query(
          `INSERT INTO notifications (id, user_id, title, message, type, priority, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            uuidv4(),
            contactId,
            'Safety Check Alert',
            `User may need assistance. Safety level: ${safetyLevel}`,
            'safety_alert',
            'high'
          ]
        );
      }
    }
    
    log.info({ checkId: id, userId, safetyLevel, needsHelp }, 'Safety check submitted');
    res.json({ success: true, check: safetyCheck[0] });
  } catch (err) {
    log.error({ err }, 'Failed to submit safety check');
    res.status(500).json({ error: 'Failed to submit safety check' });
  }
});

// Get single safety check
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const safetyCheck = await query('SELECT * FROM safety_checks WHERE id = $1', [req.params.id]);
    
    if (safetyCheck.length === 0) {
      res.status(404).json({ error: 'Safety check not found' });
      return;
    }
    
    res.json({ success: true, check: safetyCheck[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get safety check');
    res.status(500).json({ error: 'Failed to get safety check' });
  }
});

// Update safety check status (admin/support)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, respondedBy, responseNotes } = req.body;
    
    const safetyCheck = await query(
      `UPDATE safety_checks 
       SET status = $1, responded_by = $2, response_notes = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, respondedBy, responseNotes, req.params.id]
    );
    
    if (safetyCheck.length === 0) {
      res.status(404).json({ error: 'Safety check not found' });
      return;
    }
    
    log.info({ checkId: req.params.id, status, respondedBy }, 'Safety check status updated');
    res.json({ success: true, check: safetyCheck[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update safety check status');
    res.status(500).json({ error: 'Failed to update safety check status' });
  }
});

// Get pending safety checks (for support staff)
router.get('/admin/pending', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;
    
    const checks = await query(
      `SELECT sc.*, u.secret_code as user_code
       FROM safety_checks sc
       LEFT JOIN users u ON sc.user_id = u.id
       WHERE sc.status = 'alert_triggered'
       ORDER BY sc.created_at DESC
       LIMIT $1`,
      [parseInt(limit as string)]
    );
    
    res.json({ success: true, checks });
  } catch (err) {
    log.error({ err }, 'Failed to get pending safety checks');
    res.status(500).json({ error: 'Failed to get pending safety checks' });
  }
});

export default router;
