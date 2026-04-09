import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('reports');
const router = Router();

// Submit crime/SRHR incident report
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      description,
      location,
      coordinates,
      date,
      isAnonymous,
      contactInfo,
      consentToShare,
      wantsCallback,
      userId,
      evidenceUrls
    } = req.body;
    
    if (!type || !description) {
      res.status(400).json({ error: 'Type and description are required' });
      return;
    }
    
    const id = uuidv4();
    const reportNumber = `RPT-${Date.now().toString(36).toUpperCase()}`;
    
    const report = await query(
      `INSERT INTO reports 
       (id, report_number, type, description, location, coordinates, incident_date,
        is_anonymous, contact_info, consent_to_share, wants_callback, user_id,
        evidence_urls, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'submitted', NOW(), NOW())
       RETURNING *`,
      [id, reportNumber, type, description, location || '', 
       coordinates ? JSON.stringify(coordinates) : null,
       date || new Date().toISOString(), isAnonymous || false, 
       contactInfo || '', consentToShare || false, wantsCallback || false,
       userId || null, evidenceUrls ? JSON.stringify(evidenceUrls) : null]
    );
    
    log.info({ reportId: id, reportNumber, type }, 'Report submitted');
    res.json({ success: true, report: report[0], reportNumber });
  } catch (err) {
    log.error({ err }, 'Failed to submit report');
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get all reports (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, userId, limit = '50' } = req.query;
    
    let sql = `
      SELECT r.*, 
        CASE WHEN r.is_anonymous THEN NULL ELSE u.secret_code END as reporter_code
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      sql += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (type) {
      sql += ` AND r.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (userId) {
      sql += ` AND r.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const reports = await query(sql, params);
    res.json({ success: true, reports });
  } catch (err) {
    log.error({ err }, 'Failed to get reports');
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Get single report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const reports = await query(
      `SELECT r.*, 
        CASE WHEN r.is_anonymous THEN NULL ELSE u.secret_code END as reporter_code
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (reports.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    
    // Get status history
    const history = await query(
      'SELECT * FROM report_status_history WHERE report_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json({ success: true, report: reports[0], history });
  } catch (err) {
    log.error({ err }, 'Failed to get report');
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Update report status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, updatedBy } = req.body;
    
    const validStatuses = ['submitted', 'under_review', 'investigating', 'resolved', 'closed', 'escalated'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    // Update report
    const report = await query(
      'UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (report.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    
    // Add to status history
    const historyId = uuidv4();
    await query(
      `INSERT INTO report_status_history (id, report_id, status, notes, updated_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [historyId, id, status, notes || '', updatedBy || null]
    );
    
    log.info({ reportId: id, status }, 'Report status updated');
    res.json({ success: true, report: report[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update report status');
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

// Add note to report
router.post('/:id/notes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note, createdBy, isInternal = true } = req.body;
    
    if (!note) {
      res.status(400).json({ error: 'Note is required' });
      return;
    }
    
    const noteId = uuidv4();
    const result = await query(
      `INSERT INTO report_notes (id, report_id, note, created_by, is_internal, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [noteId, id, note, createdBy || null, isInternal]
    );
    
    log.info({ reportId: id, noteId }, 'Report note added');
    res.json({ success: true, note: result[0] });
  } catch (err) {
    log.error({ err }, 'Failed to add report note');
    res.status(500).json({ error: 'Failed to add report note' });
  }
});

// Get report notes
router.get('/:id/notes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeInternal = 'false' } = req.query;
    
    let sql = 'SELECT * FROM report_notes WHERE report_id = $1';
    const params: any[] = [id];
    
    if (includeInternal !== 'true') {
      sql += ' AND is_internal = false';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const notes = await query(sql, params);
    res.json({ success: true, notes });
  } catch (err) {
    log.error({ err }, 'Failed to get report notes');
    res.status(500).json({ error: 'Failed to get report notes' });
  }
});

export default router;
