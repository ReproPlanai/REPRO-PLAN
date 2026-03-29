import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('workflows');
const router = Router();

// Get all workflows
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isActive, triggerType } = req.query;
    
    let sql = 'SELECT * FROM workflows WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (triggerType) {
      sql += ` AND trigger_type = $${paramIndex}`;
      params.push(triggerType);
      paramIndex++;
    }
    
    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const workflows = await query(sql, params);
    res.json({ success: true, workflows });
  } catch (err) {
    log.error({ err }, 'Failed to get workflows');
    res.status(500).json({ error: 'Failed to get workflows' });
  }
});

// Create workflow
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, triggerType, triggerConditions, actions, isActive = true, createdBy } = req.body;
    
    if (!name || !triggerType || !actions) {
      res.status(400).json({ error: 'Name, triggerType, and actions are required' });
      return;
    }
    
    const id = uuidv4();
    const workflow = await query(
      `INSERT INTO workflows (id, name, description, category, trigger_type, trigger_conditions, actions, is_active, created_by, run_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [id, name, description, category, triggerType, JSON.stringify(triggerConditions || {}), JSON.stringify(actions), isActive, createdBy, 0]
    );
    
    log.info({ workflowId: id, name, triggerType }, 'Workflow created');
    res.json({ success: true, workflow: workflow[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create workflow');
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Get single workflow
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await query('SELECT * FROM workflows WHERE id = $1', [req.params.id]);
    
    if (workflow.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    
    // Get execution history
    const executions = await query(
      'SELECT * FROM workflow_executions WHERE workflow_id = $1 ORDER BY started_at DESC LIMIT 50',
      [req.params.id]
    );
    
    res.json({ success: true, workflow: workflow[0], executions });
  } catch (err) {
    log.error({ err }, 'Failed to get workflow');
    res.status(500).json({ error: 'Failed to get workflow' });
  }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, category, triggerType, triggerConditions, actions, isActive } = req.body;
    
    const workflow = await query(
      `UPDATE workflows 
       SET name = $1, description = $2, category = $3, trigger_type = $4, 
           trigger_conditions = $5, actions = $6, is_active = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, category, triggerType, JSON.stringify(triggerConditions), JSON.stringify(actions), isActive, req.params.id]
    );
    
    if (workflow.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    
    log.info({ workflowId: req.params.id }, 'Workflow updated');
    res.json({ success: true, workflow: workflow[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update workflow');
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Execute workflow manually
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { triggeredBy, inputData } = req.body;
    
    const workflow = await query('SELECT * FROM workflows WHERE id = $1', [req.params.id]);
    
    if (workflow.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    
    const executionId = uuidv4();
    const startedAt = new Date();
    
    // Create execution record
    await query(
      `INSERT INTO workflow_executions (id, workflow_id, status, triggered_by, input_data, started_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [executionId, req.params.id, 'running', triggeredBy, JSON.stringify(inputData || {}), startedAt]
    );
    
    // Update workflow run count
    await query('UPDATE workflows SET run_count = run_count + 1, last_run_at = NOW() WHERE id = $1', [req.params.id]);
    
    // Execute workflow actions (simplified - would be more complex in real implementation)
    try {
      const actions = workflow[0].actions || [];
      const results = [];
      
      for (const action of actions) {
        // Execute action based on type
        const result = await executeAction(action, inputData);
        results.push(result);
      }
      
      // Mark as completed
      await query(
        `UPDATE workflow_executions 
         SET status = $1, results = $2, completed_at = NOW()
         WHERE id = $3`,
        ['completed', JSON.stringify(results), executionId]
      );
      
      log.info({ workflowId: req.params.id, executionId }, 'Workflow executed successfully');
      res.json({ success: true, executionId, status: 'completed', results });
    } catch (execErr) {
      // Mark as failed
      await query(
        `UPDATE workflow_executions 
         SET status = $1, error = $2, completed_at = NOW()
         WHERE id = $3`,
        ['failed', execErr instanceof Error ? execErr.message : 'Execution failed', executionId]
      );
      
      throw execErr;
    }
  } catch (err) {
    log.error({ err }, 'Failed to execute workflow');
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// Helper function to execute workflow actions
async function executeAction(action: any, inputData: any) {
  // This is a simplified placeholder - real implementation would handle various action types
  switch (action.type) {
    case 'notification':
      return { type: 'notification', status: 'sent', recipients: action.recipients };
    case 'alert':
      return { type: 'alert', status: 'created', severity: action.severity };
    case 'email':
      return { type: 'email', status: 'queued', to: action.to };
    case 'webhook':
      return { type: 'webhook', status: 'called', url: action.url };
    default:
      return { type: action.type, status: 'executed' };
  }
}

// Get workflow execution history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;
    
    const executions = await query(
      `SELECT * FROM workflow_executions 
       WHERE workflow_id = $1 
       ORDER BY started_at DESC 
       LIMIT $2`,
      [req.params.id, parseInt(limit as string)]
    );
    
    res.json({ success: true, executions });
  } catch (err) {
    log.error({ err }, 'Failed to get workflow history');
    res.status(500).json({ error: 'Failed to get workflow history' });
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Delete executions first
    await query('DELETE FROM workflow_executions WHERE workflow_id = $1', [req.params.id]);
    
    const result = await query('DELETE FROM workflows WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    
    log.info({ workflowId: req.params.id }, 'Workflow deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete workflow');
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

export default router;
