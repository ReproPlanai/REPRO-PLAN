import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('qr');
const router = Router();

// Generate QR code
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, type = 'verification', expiresIn = 3600, data } = req.body;
    
    const id = uuidv4();
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Store in database
    const qrCode = await query(
      `INSERT INTO qr_codes (id, code, user_id, stakeholder_id, type, status, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [id, code, userId, stakeholderId, type, 'active', expiresAt]
    );
    
    // Generate QR code data
    const qrData = data || JSON.stringify({
      code,
      type,
      id,
      verifyUrl: `${process.env.FRONTEND_URL || 'https://repro-plan.vercel.app'}/verify-qr?code=${code}`,
      userId,
      stakeholderId
    });
    
    // Generate actual QR code image (base64)
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Also generate SVG version
    const qrSvg = await QRCode.toString(qrData, {
      type: 'svg',
      width: 400,
      margin: 2
    });
    
    log.info({ qrId: id, type, userId, stakeholderId }, 'QR code generated');
    res.json({ 
      success: true, 
      qrCode: {
        ...qrCode[0],
        qrImage, // Base64 PNG
        qrSvg,   // SVG string
        data: qrData
      }
    });
  } catch (err) {
    log.error({ err }, 'Failed to generate QR code');
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Verify QR code
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      res.status(400).json({ error: 'QR code is required' });
      return;
    }
    
    // Find QR code
    const qrCode = await query(
      `SELECT * FROM qr_codes WHERE code = $1 AND status = 'active'`,
      [code]
    );
    
    if (qrCode.length === 0) {
      res.status(404).json({ error: 'Invalid or expired QR code' });
      return;
    }
    
    const qr = qrCode[0];
    
    // Check if expired
    if (new Date(qr.expires_at) < new Date()) {
      await query('UPDATE qr_codes SET status = $1 WHERE id = $2', ['expired', qr.id]);
      res.status(410).json({ error: 'QR code has expired' });
      return;
    }
    
    // Mark as used
    await query('UPDATE qr_codes SET status = $1, used_at = NOW() WHERE id = $2', ['used', qr.id]);
    
    // Get user/stakeholder info
    let entityInfo = null;
    if (qr.user_id) {
      const user = await query('SELECT id, survey_link FROM users WHERE id = $1', [qr.user_id]);
      entityInfo = { type: 'user', data: user[0] };
    } else if (qr.stakeholder_id) {
      const stakeholder = await query('SELECT id, role, name FROM stakeholders WHERE id = $1', [qr.stakeholder_id]);
      entityInfo = { type: 'stakeholder', data: stakeholder[0] };
    }
    
    log.info({ qrId: qr.id, type: qr.type }, 'QR code verified');
    res.json({ success: true, verified: true, type: qr.type, entity: entityInfo });
  } catch (err) {
    log.error({ err }, 'Failed to verify QR code');
    res.status(500).json({ error: 'Failed to verify QR code' });
  }
});

// Get QR codes for user/stakeholder
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, stakeholderId, status } = req.query;
    
    let sql = 'SELECT * FROM qr_codes WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (stakeholderId) {
      sql += ` AND stakeholder_id = $${paramIndex}`;
      params.push(stakeholderId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const qrCodes = await query(sql, params);
    res.json({ success: true, qrCodes });
  } catch (err) {
    log.error({ err }, 'Failed to get QR codes');
    res.status(500).json({ error: 'Failed to get QR codes' });
  }
});

// Deactivate QR code
router.put('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const qrCode = await query(
      'UPDATE qr_codes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['inactive', req.params.id]
    );
    
    if (qrCode.length === 0) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }
    
    res.json({ success: true, qrCode: qrCode[0] });
  } catch (err) {
    log.error({ err }, 'Failed to deactivate QR code');
    res.status(500).json({ error: 'Failed to deactivate QR code' });
  }
});

// Cleanup expired QR codes
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const result = await query(
      "UPDATE qr_codes SET status = 'expired' WHERE status = 'active' AND expires_at < NOW() RETURNING id"
    );
    
    log.info({ count: result.length }, 'Expired QR codes cleaned up');
    res.json({ success: true, expired: result.length });
  } catch (err) {
    log.error({ err }, 'Failed to cleanup QR codes');
    res.status(500).json({ error: 'Failed to cleanup QR codes' });
  }
});

export default router;
