import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('errors');
const router = Router();

// Error report interface
interface ErrorReport {
  message: string;
  stack?: string;
  context: {
    userAgent?: string;
    url?: string;
    timestamp?: string;
    userId?: string;
    [key: string]: any;
  };
}

// Submit error report
router.post('/', async (req: Request, res: Response) => {
  try {
    const errorReport: ErrorReport = req.body;
    
    if (!errorReport.message) {
      res.status(400).json({ error: 'Error message is required' });
      return;
    }

    const id = uuidv4();
    
    // Log to system logger
    log.error({
      errorId: id,
      message: errorReport.message,
      stack: errorReport.stack,
      context: errorReport.context
    }, 'Client error reported');

    // Store in database if available
    try {
      await query(
        `INSERT INTO error_reports 
         (id, message, stack, user_agent, url, user_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          id,
          errorReport.message,
          errorReport.stack || '',
          errorReport.context?.userAgent || '',
          errorReport.context?.url || '',
          errorReport.context?.userId || null
        ]
      );
    } catch (dbErr) {
      // Don't fail if DB storage fails - still logged above
      log.warn({ dbErr }, 'Failed to store error report in database');
    }

    res.json({ 
      success: true, 
      errorId: id,
      message: 'Error report received'
    });
  } catch (err) {
    log.error({ err }, 'Failed to process error report');
    res.status(500).json({ error: 'Failed to process error report' });
  }
});

// Get error reports (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', status = 'new' } = req.query;
    
    const reports = await query(
      `SELECT * FROM error_reports 
       WHERE status = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [status, parseInt(limit as string)]
    );
    
    res.json({ success: true, reports });
  } catch (err) {
    log.error({ err }, 'Failed to get error reports');
    res.status(500).json({ error: 'Failed to get error reports' });
  }
});

// Update error report status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['new', 'investigating', 'resolved', 'ignored'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    const result = await query(
      `UPDATE error_reports 
       SET status = $1, notes = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, notes || '', id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Error report not found' });
      return;
    }
    
    res.json({ success: true, report: result[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update error report status');
    res.status(500).json({ error: 'Failed to update error report status' });
  }
});

export default router;
