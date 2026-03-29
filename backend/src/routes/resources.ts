import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('resources');
const router = Router();

// Get all resources
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, type, language, isActive, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (type) {
      sql += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (language) {
      sql += ` AND languages @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([language]));
      paramIndex++;
    }
    
    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const resources = await query(sql, params);
    res.json({ success: true, resources });
  } catch (err) {
    log.error({ err }, 'Failed to get resources');
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

// Create resource
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, type, url, content, languages, tags, thumbnail, createdBy } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const id = uuidv4();
    const resource = await query(
      `INSERT INTO resources (id, title, description, category, type, url, content, languages, tags, thumbnail, created_by, view_count, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [id, title, description, category, type, url, content, JSON.stringify(languages || []), JSON.stringify(tags || []), thumbnail, createdBy, 0, true]
    );
    
    log.info({ resourceId: id, title, category }, 'Resource created');
    res.json({ success: true, resource: resource[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create resource');
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Get single resource
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const resource = await query('SELECT * FROM resources WHERE id = $1', [req.params.id]);
    
    if (resource.length === 0) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    
    // Increment view count
    await query('UPDATE resources SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    
    res.json({ success: true, resource: resource[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get resource');
    res.status(500).json({ error: 'Failed to get resource' });
  }
});

// Update resource
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, category, type, url, content, languages, tags, thumbnail, isActive } = req.body;
    
    const resource = await query(
      `UPDATE resources 
       SET title = $1, description = $2, category = $3, type = $4, url = $5, content = $6, 
           languages = $7, tags = $8, thumbnail = $9, is_active = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [title, description, category, type, url, content, JSON.stringify(languages), JSON.stringify(tags), thumbnail, isActive, req.params.id]
    );
    
    if (resource.length === 0) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    
    log.info({ resourceId: req.params.id }, 'Resource updated');
    res.json({ success: true, resource: resource[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update resource');
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete resource
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM resources WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    
    log.info({ resourceId: req.params.id }, 'Resource deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete resource');
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Get resource categories
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    const categories = await query(
      'SELECT category, COUNT(*) as count FROM resources WHERE is_active = true GROUP BY category ORDER BY count DESC'
    );
    res.json({ success: true, categories });
  } catch (err) {
    log.error({ err }, 'Failed to get resource categories');
    res.status(500).json({ error: 'Failed to get resource categories' });
  }
});

export default router;
