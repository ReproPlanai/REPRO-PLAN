import { Router, Request, Response } from 'express';
import { HealthRecord, User } from '../models';
import { body, validationResult } from 'express-validator';

const router = Router();

// Get health records for a user
router.get('/records/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const records = await HealthRecord.findAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      records
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health records',
      error: error.message
    });
  }
});

// Create health record
router.post(
  '/records',
  [
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('recordType').notEmpty().withMessage('Record type is required'),
    body('data').isObject().withMessage('Data must be an object')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId, recordType, data } = req.body;

      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const record = await HealthRecord.create({
        userId,
        recordType,
        data
      });

      res.status(201).json({
        success: true,
        message: 'Health record created successfully',
        record
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating health record',
        error: error.message
      });
    }
  }
);

export default router;

