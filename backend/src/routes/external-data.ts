import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('external-data');
const router = Router();

// Get external data connections
router.get('/', async (req: Request, res: Response) => {
  try {
    const { stakeholderId, type, status } = req.query;
    
    let sql = 'SELECT * FROM external_data_connections WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (stakeholderId) {
      sql += ` AND stakeholder_id = $${paramIndex}`;
      params.push(stakeholderId);
      paramIndex++;
    }
    
    if (type) {
      sql += ` AND connection_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const connections = await query(sql, params);
    res.json({ success: true, connections });
  } catch (err) {
    log.error({ err }, 'Failed to get external data connections');
    res.status(500).json({ error: 'Failed to get external data connections' });
  }
});

// Create external data connection
router.post('/', async (req: Request, res: Response) => {
  try {
    const { stakeholderId, name, connectionType, config, credentials } = req.body;
    
    if (!stakeholderId || !name || !connectionType) {
      res.status(400).json({ error: 'stakeholderId, name, and connectionType are required' });
      return;
    }
    
    const id = uuidv4();
    const connection = await query(
      `INSERT INTO external_data_connections 
       (id, stakeholder_id, name, connection_type, config, credentials, status, last_sync_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())
       RETURNING *`,
      [id, stakeholderId, name, connectionType, JSON.stringify(config || {}), JSON.stringify(credentials || {}), 'active']
    );
    
    log.info({ connectionId: id, stakeholderId, connectionType }, 'External data connection created');
    res.json({ success: true, connection: connection[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create external data connection');
    res.status(500).json({ error: 'Failed to create external data connection' });
  }
});

// Sync external data connection
router.post('/sync/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get connection details
    const connections = await query(
      'SELECT * FROM external_data_connections WHERE id = $1',
      [id]
    );
    
    if (connections.length === 0) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }
    
    const connection = connections[0];
    
    // Simulate sync process (in production, this would connect to external APIs)
    const syncResults = {
      recordsImported: Math.floor(Math.random() * 100),
      recordsUpdated: Math.floor(Math.random() * 50),
      errors: [],
      syncDuration: Math.floor(Math.random() * 5000) + 1000
    };
    
    // Update last sync timestamp
    await query(
      'UPDATE external_data_connections SET last_sync_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Log sync activity
    const logId = uuidv4();
    await query(
      `INSERT INTO external_data_sync_logs (id, connection_id, status, records_processed, errors, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${syncResults.syncDuration} milliseconds', NOW())`,
      [logId, id, 'success', syncResults.recordsImported + syncResults.recordsUpdated, JSON.stringify(syncResults.errors)]
    );
    
    log.info({ connectionId: id, results: syncResults }, 'External data sync completed');
    res.json({ success: true, syncResults });
  } catch (err) {
    log.error({ err }, 'Failed to sync external data');
    res.status(500).json({ error: 'Failed to sync external data' });
  }
});

// Update external data connection
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, config, status } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;
    
    if (name) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    
    if (config) {
      updates.push(`config = $${paramIndex}`);
      params.push(JSON.stringify(config));
      paramIndex++;
    }
    
    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }
    
    updates.push(`updated_at = NOW()`);
    
    const connection = await query(
      `UPDATE external_data_connections SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    
    if (connection.length === 0) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }
    
    log.info({ connectionId: id }, 'External data connection updated');
    res.json({ success: true, connection: connection[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update external data connection');
    res.status(500).json({ error: 'Failed to update external data connection' });
  }
});

// Delete external data connection
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM external_data_connections WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }
    
    log.info({ connectionId: id }, 'External data connection deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete external data connection');
    res.status(500).json({ error: 'Failed to delete external data connection' });
  }
});

export default router;
