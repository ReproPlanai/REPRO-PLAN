import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('stories');
const router = Router();

// Get all stories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status = 'approved', limit = '20' } = req.query;
    
    const stories = await query(
      `SELECT s.*, u.secret_code as author_code 
       FROM stories s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.status = $1 
       ORDER BY s.created_at DESC 
       LIMIT $2`,
      [status, parseInt(limit as string)]
    );
    
    res.json({ success: true, stories });
  } catch (err) {
    log.error({ err }, 'Failed to get stories');
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

// Create story
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, content, category, tags, isAnonymous = true } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    
    const id = uuidv4();
    const story = await query(
      `INSERT INTO stories (id, user_id, title, content, category, tags, status, is_anonymous, likes_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, userId, title, content, category, JSON.stringify(tags || []), 'pending', isAnonymous, 0]
    );
    
    log.info({ storyId: id, userId }, 'Story created');
    res.json({ success: true, story: story[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create story');
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Get single story
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const story = await query(
      `SELECT s.*, u.secret_code as author_code 
       FROM stories s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.id = $1`,
      [req.params.id]
    );
    
    if (story.length === 0) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
    
    // Increment view count
    await query('UPDATE stories SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1', [req.params.id]);
    
    res.json({ success: true, story: story[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get story');
    res.status(500).json({ error: 'Failed to get story' });
  }
});

// Update story status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    const story = await query(
      'UPDATE stories SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    if (story.length === 0) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
    
    log.info({ storyId: req.params.id, status }, 'Story status updated');
    res.json({ success: true, story: story[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update story status');
    res.status(500).json({ error: 'Failed to update story status' });
  }
});

// Like story
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    // Check if already liked
    const existing = await query(
      'SELECT id FROM story_likes WHERE story_id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (existing.length > 0) {
      res.status(409).json({ error: 'Already liked' });
      return;
    }
    
    // Add like
    await query(
      'INSERT INTO story_likes (id, story_id, user_id, created_at) VALUES ($1, $2, $3, NOW())',
      [uuidv4(), req.params.id, userId]
    );
    
    // Update like count
    await query(
      'UPDATE stories SET likes_count = likes_count + 1 WHERE id = $1',
      [req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to like story');
    res.status(500).json({ error: 'Failed to like story' });
  }
});

// Delete story
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Delete likes first
    await query('DELETE FROM story_likes WHERE story_id = $1', [req.params.id]);
    
    const result = await query('DELETE FROM stories WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
    
    log.info({ storyId: req.params.id }, 'Story deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete story');
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
