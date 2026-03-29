import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('chat-rooms');
const router = Router();

// Get chat rooms
router.get('/rooms', async (req: Request, res: Response) => {
  try {
    const { role, isPrivate, limit = '50' } = req.query;
    
    let sql = 'SELECT * FROM chat_rooms WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (role) {
      sql += ` AND (allowed_roles IS NULL OR allowed_roles @> $${paramIndex}::jsonb)`;
      params.push(JSON.stringify([role]));
      paramIndex++;
    }
    
    if (isPrivate !== undefined) {
      sql += ` AND is_private = $${paramIndex}`;
      params.push(isPrivate === 'true');
      paramIndex++;
    }
    
    sql += ` AND is_active = true ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const rooms = await query(sql, params);
    res.json({ success: true, rooms });
  } catch (err) {
    log.error({ err }, 'Failed to get chat rooms');
    res.status(500).json({ error: 'Failed to get chat rooms' });
  }
});

// Create chat room
router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { name, description, createdBy, allowedRoles, isPrivate = false, password } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }
    
    const id = uuidv4();
    const room = await query(
      `INSERT INTO chat_rooms (id, name, description, created_by, allowed_roles, is_private, password, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [id, name, description, createdBy, JSON.stringify(allowedRoles || []), isPrivate, password, true]
    );
    
    log.info({ roomId: id, name, createdBy }, 'Chat room created');
    res.json({ success: true, room: room[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create chat room');
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Get chat room messages
router.get('/rooms/:id/messages', async (req: Request, res: Response) => {
  try {
    const { limit = '50', before } = req.query;
    
    let sql = 'SELECT * FROM chat_messages WHERE room_id = $1';
    const params: any[] = [req.params.id];
    let paramIndex = 2;
    
    if (before) {
      sql += ` AND created_at < $${paramIndex}`;
      params.push(before);
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));
    
    const messages = await query(sql, params);
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    log.error({ err }, 'Failed to get chat messages');
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
});

// Post message to chat room
router.post('/rooms/:id/messages', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, content, messageType = 'text' } = req.body;
    
    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }
    
    const id = uuidv4();
    const message = await query(
      `INSERT INTO chat_messages (id, room_id, user_id, stakeholder_id, content, message_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, req.params.id, userId, stakeholderId, content, messageType]
    );
    
    // Update room last activity
    await query('UPDATE chat_rooms SET last_activity_at = NOW(), updated_at = NOW() WHERE id = $1', [req.params.id]);
    
    log.info({ messageId: id, roomId: req.params.id, userId, stakeholderId }, 'Chat message posted');
    res.json({ success: true, message: message[0] });
  } catch (err) {
    log.error({ err }, 'Failed to post chat message');
    res.status(500).json({ error: 'Failed to post chat message' });
  }
});

// Join chat room
router.post('/rooms/:id/join', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    // Check if already a member
    const existing = await query(
      'SELECT id FROM chat_room_members WHERE room_id = $1 AND (user_id = $2 OR stakeholder_id = $3)',
      [req.params.id, userId, stakeholderId]
    );
    
    if (existing.length > 0) {
      res.json({ success: true, alreadyMember: true });
      return;
    }
    
    const id = uuidv4();
    await query(
      `INSERT INTO chat_room_members (id, room_id, user_id, stakeholder_id, joined_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, req.params.id, userId, stakeholderId]
    );
    
    // Update member count
    await query('UPDATE chat_rooms SET member_count = member_count + 1, updated_at = NOW() WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to join chat room');
    res.status(500).json({ error: 'Failed to join chat room' });
  }
});

// Leave chat room
router.post('/rooms/:id/leave', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId } = req.body;
    
    await query(
      'DELETE FROM chat_room_members WHERE room_id = $1 AND (user_id = $2 OR stakeholder_id = $3)',
      [req.params.id, userId, stakeholderId]
    );
    
    // Update member count
    await query('UPDATE chat_rooms SET member_count = GREATEST(0, member_count - 1), updated_at = NOW() WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to leave chat room');
    res.status(500).json({ error: 'Failed to leave chat room' });
  }
});

// Get room members
router.get('/rooms/:id/members', async (req: Request, res: Response) => {
  try {
    const members = await query(
      `SELECT crm.*, 
        COALESCE(u.secret_code, s.name) as display_name,
        s.role as stakeholder_role
       FROM chat_room_members crm
       LEFT JOIN users u ON crm.user_id = u.id
       LEFT JOIN stakeholders s ON crm.stakeholder_id = s.id
       WHERE crm.room_id = $1`,
      [req.params.id]
    );
    
    res.json({ success: true, members });
  } catch (err) {
    log.error({ err }, 'Failed to get room members');
    res.status(500).json({ error: 'Failed to get room members' });
  }
});

// Get conversations (alias for rooms - for direct messaging)
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { stakeholderId, userId, limit = '50' } = req.query;
    
    // Get private rooms/conversations for the user/stakeholder
    let sql = `
      SELECT cr.*, 
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', crm2.id,
            'display_name', COALESCE(u2.secret_code, s2.name),
            'role', s2.role
          ))
          FROM chat_room_members crm2
          LEFT JOIN users u2 ON crm2.user_id = u2.id
          LEFT JOIN stakeholders s2 ON crm2.stakeholder_id = s2.id
          WHERE crm2.room_id = cr.id
          AND (crm2.user_id != $1 OR crm2.stakeholder_id != $2)
          ), '[]'::json
        ) as participants
      FROM chat_rooms cr
      INNER JOIN chat_room_members crm ON cr.id = crm.room_id
      WHERE cr.is_private = true AND cr.is_active = true
      AND (crm.user_id = $1 OR crm.stakeholder_id = $2)
      ORDER BY cr.last_activity_at DESC NULLS LAST
      LIMIT $3
    `;
    
    const conversations = await query(sql, [
      userId || null, 
      stakeholderId || null, 
      parseInt(limit as string)
    ]);
    
    res.json({ success: true, conversations });
  } catch (err) {
    log.error({ err }, 'Failed to get conversations');
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

export default router;
