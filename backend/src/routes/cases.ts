import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('cases');
const router = Router();

// Get all cases with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, stakeholderId, status, priority } = req.query;
    
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (role) {
      sql += ` AND (assigned_role = $${paramIndex} OR assigned_role IS NULL)`;
      params.push(role);
      paramIndex++;
    }
    
    if (stakeholderId) {
      sql += ` AND (assigned_to = $${paramIndex} OR created_by = $${paramIndex})`;
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
    
    const caseList = await query(sql, params);
    res.json({ success: true, cases: caseList });
  } catch (err) {
    log.error({ err }, 'Failed to get cases');
    res.status(500).json({ error: 'Failed to get cases' });
  }
});

// Create case
router.post('/', async (req: Request, res: Response) => {
  try {
    const { caseType, description, location, priority, assignedTo, assignedRole, relatedAlerts, createdBy } = req.body;
    
    const id = uuidv4();
    
    // Get next case number
    const caseNumberResult = await query("SELECT MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)) as max_num FROM cases");
    const nextNum = (caseNumberResult[0]?.max_num || 0) + 1;
    const caseNumber = `CASE-${nextNum.toString().padStart(4, '0')}`;
    
    const caseItem = await query(
      `INSERT INTO cases (id, case_number, case_type, description, location, priority, status, assigned_to, assigned_role, related_alerts, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [id, caseNumber, caseType, description, JSON.stringify(location || {}), priority || 'medium', 'open', assignedTo, assignedRole, JSON.stringify(relatedAlerts || []), createdBy]
    );

    log.info({ caseId: id, caseNumber }, 'Case created');
    
    res.json({ success: true, case: caseItem[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create case');
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// Get single case
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const caseItem = await query('SELECT * FROM cases WHERE id = $1', [req.params.id]);
    if (caseItem.length === 0) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }
    res.json({ success: true, case: caseItem[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get case');
    res.status(500).json({ error: 'Failed to get case' });
  }
});

// Update case
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, description, priority, assignedTo } = req.body;
    
    const caseItem = await query(
      `UPDATE cases SET status = $1, description = $2, priority = $3, assigned_to = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status, description, priority, assignedTo, req.params.id]
    );
    
    if (caseItem.length === 0) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    log.info({ caseId: req.params.id }, 'Case updated');
    res.json({ success: true, case: caseItem[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update case');
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Delete case
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM cases WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.length === 0) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }
    log.info({ caseId: req.params.id }, 'Case deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete case');
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

export default router;
