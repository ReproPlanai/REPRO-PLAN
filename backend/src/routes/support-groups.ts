import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('support-groups');
const router = Router();

// Get all support groups
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isActive, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM support_groups WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }
    
    sql += ` ORDER BY member_count DESC, created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const groups = await query(sql, params);
    res.json({ success: true, groups });
  } catch (err) {
    log.error({ err }, 'Failed to get support groups');
    res.status(500).json({ error: 'Failed to get support groups' });
  }
});

// Create support group
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, facilitatorId, maxMembers, isPrivate, rules } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }
    
    const id = uuidv4();
    const group = await query(
      `INSERT INTO support_groups (id, name, description, category, facilitator_id, max_members, member_count, is_private, rules, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [id, name, description, category, facilitatorId, maxMembers || 50, 0, isPrivate || false, JSON.stringify(rules || []), true]
    );
    
    log.info({ groupId: id, name, category }, 'Support group created');
    res.json({ success: true, group: group[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create support group');
    res.status(500).json({ error: 'Failed to create support group' });
  }
});

// Get single support group
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const group = await query('SELECT * FROM support_groups WHERE id = $1', [req.params.id]);
    
    if (group.length === 0) {
      res.status(404).json({ error: 'Support group not found' });
      return;
    }
    
    // Get members
    const members = await query(
      `SELECT sgm.*, u.secret_code as user_code, s.name as stakeholder_name
       FROM support_group_members sgm
       LEFT JOIN users u ON sgm.user_id = u.id
       LEFT JOIN stakeholders s ON sgm.stakeholder_id = s.id
       WHERE sgm.group_id = $1`,
      [req.params.id]
    );
    
    res.json({ success: true, group: group[0], members });
  } catch (err) {
    log.error({ err }, 'Failed to get support group');
    res.status(500).json({ error: 'Failed to get support group' });
  }
});

// Join support group
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    // Check group exists and has space
    const group = await query('SELECT max_members, member_count, is_private FROM support_groups WHERE id = $1', [req.params.id]);
    
    if (group.length === 0) {
      res.status(404).json({ error: 'Support group not found' });
      return;
    }
    
    if (group[0].member_count >= group[0].max_members) {
      res.status(400).json({ error: 'Group is full' });
      return;
    }
    
    // Check if already member
    const existing = await query(
      'SELECT id FROM support_group_members WHERE group_id = $1 AND (user_id = $2 OR stakeholder_id = $3)',
      [req.params.id, userId, stakeholderId]
    );
    
    if (existing.length > 0) {
      res.status(409).json({ error: 'Already a member' });
      return;
    }
    
    const id = uuidv4();
    await query(
      `INSERT INTO support_group_members (id, group_id, user_id, stakeholder_id, role, joined_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, req.params.id, userId, stakeholderId, 'member']
    );
    
    // Update member count
    await query('UPDATE support_groups SET member_count = member_count + 1, updated_at = NOW() WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to join support group');
    res.status(500).json({ error: 'Failed to join support group' });
  }
});

// Leave support group
router.post('/:id/leave', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    await query(
      'DELETE FROM support_group_members WHERE group_id = $1 AND (user_id = $2 OR stakeholder_id = $3)',
      [req.params.id, userId, stakeholderId]
    );
    
    // Update member count
    await query('UPDATE support_groups SET member_count = GREATEST(0, member_count - 1), updated_at = NOW() WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to leave support group');
    res.status(500).json({ error: 'Failed to leave support group' });
  }
});

// Update support group
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, category, maxMembers, isPrivate, isActive, rules } = req.body;
    
    const group = await query(
      `UPDATE support_groups 
       SET name = $1, description = $2, category = $3, max_members = $4, 
           is_private = $5, is_active = $6, rules = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, category, maxMembers, isPrivate, isActive, JSON.stringify(rules), req.params.id]
    );
    
    if (group.length === 0) {
      res.status(404).json({ error: 'Support group not found' });
      return;
    }
    
    log.info({ groupId: req.params.id }, 'Support group updated');
    res.json({ success: true, group: group[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update support group');
    res.status(500).json({ error: 'Failed to update support group' });
  }
});

// Delete support group
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Delete members first
    await query('DELETE FROM support_group_members WHERE group_id = $1', [req.params.id]);
    
    const result = await query('DELETE FROM support_groups WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Support group not found' });
      return;
    }
    
    log.info({ groupId: req.params.id }, 'Support group deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete support group');
    res.status(500).json({ error: 'Failed to delete support group' });
  }
});

export default router;
