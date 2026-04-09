import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';
import { generateContent } from '../services/ai';

const log = createServiceLogger('health-records');
const router = Router();

// Get all health records (admin view)
router.get('/', async (req: Request, res: Response) => {
  try {
    const records = await query('SELECT * FROM health_records ORDER BY recorded_at DESC');
    res.json({ success: true, records });
  } catch (err) {
    log.error({ err }, 'Failed to get health records');
    res.status(500).json({ error: 'Failed to get health records' });
  }
});

// Create health record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, recordType, data } = req.body;
    
    if (!userId || !recordType) {
      res.status(400).json({ error: 'User ID and record type are required' });
      return;
    }
    
    const id = uuidv4();
    
    const record = await query(
      `INSERT INTO health_records (id, user_id, record_type, data, recorded_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       RETURNING *`,
      [id, userId, recordType, JSON.stringify(data || {})]
    );

    log.info({ recordId: id, userId, type: recordType }, 'Health record created');
    
    res.json({ success: true, record: record[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create health record');
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Get single health record
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await query('SELECT * FROM health_records WHERE id = $1', [req.params.id]);
    
    if (record.length === 0) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }
    res.json({ success: true, record: record[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get health record');
    res.status(500).json({ error: 'Failed to get health record' });
  }
});

// Delete health record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM health_records WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }
    
    log.info({ recordId: req.params.id }, 'Health record deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete health record');
    res.status(500).json({ error: 'Failed to delete health record' });
  }
});

// Get AI-powered health insights for a user
router.get('/:userId/insights', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get user's health records
    const records = await query(
      'SELECT * FROM health_records WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 10',
      [userId]
    );
    
    if (records.length === 0) {
      res.json({ success: true, insights: 'No health records available for analysis.' });
      return;
    }
    
    // Generate AI insights based on health records
    const recordsSummary = records.map((r: any) => ({
      type: r.record_type,
      date: r.recorded_at,
      data: r.data
    }));
    
    const prompt = `You are an SRHR health expert. Analyze these health records and provide 3-5 personalized health insights for a user in Ghana context. Records: ${JSON.stringify(recordsSummary)}. Focus on preventive care, wellness recommendations, and when to seek professional help. Return as a concise, actionable summary.`;
    
    const insights = await generateContent(prompt, { maxTokens: 500, taskType: 'health', sessionId: userId });
    
    log.info({ userId, recordCount: records.length }, 'Health insights generated');
    res.json({ success: true, insights });
  } catch (err) {
    log.error({ err }, 'Failed to generate health insights');
    res.status(500).json({ error: 'Failed to generate health insights' });
  }
});

export default router;
