import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('biometrics');
const router = Router();

// Get biometric auth settings for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.query;
    
    if (!userId && !stakeholderId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    const entityId = userId || stakeholderId;
    const entityType = userId ? 'user' : 'stakeholder';
    
    const biometrics = await query(
      'SELECT * FROM biometric_auth WHERE entity_id = $1 AND entity_type = $2',
      [entityId, entityType]
    );
    
    res.json({ 
      success: true, 
      enabled: biometrics.length > 0 && biometrics[0].is_enabled,
      biometric: biometrics[0] || null
    });
  } catch (err) {
    log.error({ err }, 'Failed to get biometric settings');
    res.status(500).json({ error: 'Failed to get biometric settings' });
  }
});

// Register biometric
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, type, biometricHash, deviceInfo } = req.body;
    
    if (!type || !biometricHash) {
      res.status(400).json({ error: 'Type and biometricHash are required' });
      return;
    }
    
    const entityId = userId || stakeholderId;
    const entityType = userId ? 'user' : 'stakeholder';
    
    if (!entityId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    const id = uuidv4();
    
    // Check if already registered
    const existing = await query(
      'SELECT id FROM biometric_auth WHERE entity_id = $1 AND entity_type = $2',
      [entityId, entityType]
    );
    
    if (existing.length > 0) {
      // Update existing
      const biometric = await query(
        `UPDATE biometric_auth 
         SET biometric_hash = $1, type = $2, device_info = $3, is_enabled = true, updated_at = NOW()
         WHERE entity_id = $4 AND entity_type = $5
         RETURNING *`,
        [biometricHash, type, JSON.stringify(deviceInfo), entityId, entityType]
      );
      
      log.info({ biometricId: biometric[0].id, entityId, entityType }, 'Biometric updated');
      res.json({ success: true, biometric: biometric[0] });
    } else {
      // Create new
      const biometric = await query(
        `INSERT INTO biometric_auth (id, entity_id, entity_type, biometric_hash, type, device_info, is_enabled, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [id, entityId, entityType, biometricHash, type, JSON.stringify(deviceInfo), true]
      );
      
      log.info({ biometricId: id, entityId, entityType }, 'Biometric registered');
      res.json({ success: true, biometric: biometric[0] });
    }
  } catch (err) {
    log.error({ err }, 'Failed to register biometric');
    res.status(500).json({ error: 'Failed to register biometric' });
  }
});

// Authenticate with biometric
router.post('/authenticate', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, type, biometricHash } = req.body;
    
    if (!type || !biometricHash) {
      res.status(400).json({ error: 'Type and biometricHash are required' });
      return;
    }
    
    const entityId = userId || stakeholderId;
    const entityType = userId ? 'user' : 'stakeholder';
    
    if (!entityId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    // Verify biometric
    const biometric = await query(
      `SELECT * FROM biometric_auth 
       WHERE entity_id = $1 AND entity_type = $2 AND type = $3 AND is_enabled = true`,
      [entityId, entityType, type]
    );
    
    if (biometric.length === 0) {
      res.status(404).json({ error: 'Biometric not registered' });
      return;
    }
    
    // Compare hashes (in real implementation, use proper comparison)
    const isMatch = biometric[0].biometric_hash === biometricHash;
    
    if (!isMatch) {
      // Log failed attempt
      await query(
        `INSERT INTO biometric_attempts (id, biometric_id, success, ip_address, attempted_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), biometric[0].id, false, req.ip]
      );
      
      res.status(401).json({ error: 'Biometric verification failed' });
      return;
    }
    
    // Update last used
    await query(
      'UPDATE biometric_auth SET last_used_at = NOW(), updated_at = NOW() WHERE id = $1',
      [biometric[0].id]
    );
    
    // Log successful attempt
    await query(
      `INSERT INTO biometric_attempts (id, biometric_id, success, ip_address, attempted_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), biometric[0].id, true, req.ip]
    );
    
    const token = uuidv4();
    
    log.info({ biometricId: biometric[0].id, entityId, entityType }, 'Biometric authentication successful');
    res.json({ success: true, authenticated: true, token });
  } catch (err) {
    log.error({ err }, 'Failed to authenticate biometric');
    res.status(500).json({ error: 'Failed to authenticate biometric' });
  }
});

// Disable biometric
router.put('/disable', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    const entityId = userId || stakeholderId;
    const entityType = userId ? 'user' : 'stakeholder';
    
    if (!entityId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    const biometric = await query(
      'UPDATE biometric_auth SET is_enabled = false, updated_at = NOW() WHERE entity_id = $1 AND entity_type = $2 RETURNING *',
      [entityId, entityType]
    );
    
    if (biometric.length === 0) {
      res.status(404).json({ error: 'Biometric not found' });
      return;
    }
    
    res.json({ success: true, biometric: biometric[0] });
  } catch (err) {
    log.error({ err }, 'Failed to disable biometric');
    res.status(500).json({ error: 'Failed to disable biometric' });
  }
});

// Delete biometric
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    const entityId = userId || stakeholderId;
    const entityType = userId ? 'user' : 'stakeholder';
    
    if (!entityId) {
      res.status(400).json({ error: 'userId or stakeholderId required' });
      return;
    }
    
    // Delete attempts first
    const biometricId = await query(
      'SELECT id FROM biometric_auth WHERE entity_id = $1 AND entity_type = $2',
      [entityId, entityType]
    );
    
    if (biometricId.length > 0) {
      await query('DELETE FROM biometric_attempts WHERE biometric_id = $1', [biometricId[0].id]);
    }
    
    const result = await query(
      'DELETE FROM biometric_auth WHERE entity_id = $1 AND entity_type = $2 RETURNING id',
      [entityId, entityType]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Biometric not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete biometric');
    res.status(500).json({ error: 'Failed to delete biometric' });
  }
});

export default router;
