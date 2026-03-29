import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('mentors');
const router = Router();

// Get all mentors
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialty, isAvailable, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM mentors WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (specialty) {
      sql += ` AND specialties @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([specialty]));
      paramIndex++;
    }
    
    if (isAvailable !== undefined) {
      sql += ` AND is_available = $${paramIndex}`;
      params.push(isAvailable === 'true');
      paramIndex++;
    }
    
    sql += ` AND is_active = true ORDER BY rating DESC, created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const mentors = await query(sql, params);
    res.json({ success: true, mentors });
  } catch (err) {
    log.error({ err }, 'Failed to get mentors');
    res.status(500).json({ error: 'Failed to get mentors' });
  }
});

// Create mentor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, bio, specialties, languages, calendarLink, stakeholderId } = req.body;
    
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }
    
    const id = uuidv4();
    const mentor = await query(
      `INSERT INTO mentors (id, name, email, phone, bio, specialties, languages, calendar_link, stakeholder_id, rating, is_available, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [id, name, email, phone, bio, JSON.stringify(specialties || []), JSON.stringify(languages || []), calendarLink, stakeholderId, 0, true, true]
    );
    
    log.info({ mentorId: id, name, email }, 'Mentor created');
    res.json({ success: true, mentor: mentor[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create mentor');
    res.status(500).json({ error: 'Failed to create mentor' });
  }
});

// Get single mentor
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mentor = await query('SELECT * FROM mentors WHERE id = $1', [req.params.id]);
    
    if (mentor.length === 0) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }
    
    // Get mentor's availability
    const availability = await query(
      'SELECT * FROM mentor_availability WHERE mentor_id = $1 AND date >= CURRENT_DATE ORDER BY date, start_time',
      [req.params.id]
    );
    
    res.json({ success: true, mentor: { ...mentor[0], availability } });
  } catch (err) {
    log.error({ err }, 'Failed to get mentor');
    res.status(500).json({ error: 'Failed to get mentor' });
  }
});

// Update mentor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, bio, specialties, languages, calendarLink, isAvailable, isActive } = req.body;
    
    const mentor = await query(
      `UPDATE mentors 
       SET name = $1, email = $2, phone = $3, bio = $4, specialties = $5, languages = $6, 
           calendar_link = $7, is_available = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, email, phone, bio, JSON.stringify(specialties), JSON.stringify(languages), calendarLink, isAvailable, isActive, req.params.id]
    );
    
    if (mentor.length === 0) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }
    
    log.info({ mentorId: req.params.id }, 'Mentor updated');
    res.json({ success: true, mentor: mentor[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update mentor');
    res.status(500).json({ error: 'Failed to update mentor' });
  }
});

// Book mentoring session
router.post('/:id/book', async (req: Request, res: Response) => {
  try {
    const { userId, date, time, topic, notes } = req.body;
    
    const id = uuidv4();
    const session = await query(
      `INSERT INTO mentor_sessions (id, mentor_id, user_id, scheduled_date, scheduled_time, topic, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [id, req.params.id, userId, date, time, topic, notes, 'pending']
    );
    
    // Create notification for mentor
    await query(
      `INSERT INTO notifications (id, stakeholder_id, title, message, type, created_at)
       SELECT $1, stakeholder_id, $2, $3, $4, NOW()
       FROM mentors WHERE id = $5`,
      [uuidv4(), 'New Mentoring Request', `A user has requested a mentoring session on ${date} at ${time}`, 'mentoring', req.params.id]
    );
    
    log.info({ sessionId: id, mentorId: req.params.id, userId }, 'Mentoring session booked');
    res.json({ success: true, session: session[0] });
  } catch (err) {
    log.error({ err }, 'Failed to book mentoring session');
    res.status(500).json({ error: 'Failed to book mentoring session' });
  }
});

// Get mentor sessions (for user or mentor)
router.get('/sessions/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { status } = req.query;
    
    let sql = 'SELECT ms.*, m.name as mentor_name FROM mentor_sessions ms JOIN mentors m ON ms.mentor_id = m.id WHERE';
    const params: any[] = [];
    
    if (type === 'user') {
      sql += ' ms.user_id = $1';
    } else {
      sql += ' ms.mentor_id = $1';
    }
    params.push(id);
    
    if (status) {
      sql += ' AND ms.status = $2';
      params.push(status);
    }
    
    sql += ' ORDER BY ms.scheduled_date DESC, ms.scheduled_time DESC';
    
    const sessions = await query(sql, params);
    res.json({ success: true, sessions });
  } catch (err) {
    log.error({ err }, 'Failed to get mentoring sessions');
    res.status(500).json({ error: 'Failed to get mentoring sessions' });
  }
});

// Update session status
router.put('/sessions/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    
    const session = await query(
      'UPDATE mentor_sessions SET status = $1, notes = COALESCE(notes, \'\') || $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, notes ? '\n' + notes : '', req.params.id]
    );
    
    if (session.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    
    res.json({ success: true, session: session[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update session status');
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// Delete mentor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Cancel pending sessions first
    await query(
      "UPDATE mentor_sessions SET status = 'cancelled', updated_at = NOW() WHERE mentor_id = $1 AND status IN ('pending', 'confirmed')",
      [req.params.id]
    );
    
    const result = await query('DELETE FROM mentors WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }
    
    log.info({ mentorId: req.params.id }, 'Mentor deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete mentor');
    res.status(500).json({ error: 'Failed to delete mentor' });
  }
});

export default router;
