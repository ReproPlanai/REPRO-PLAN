import { Router, Request, Response } from 'express';
import { User } from '../models';
import { roleGuard } from '../middleware/roleGuard';
import { authGuard } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authGuard, roleGuard(['ADMIN']), async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['secretCode'] },
      order: [['createdAt', 'DESC']],
      limit: 200
    });

    res.json({
      success: true,
      users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user profile
router.get('/:id', authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['secretCode'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:id', authGuard, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      isVerified: isVerified !== undefined ? isVerified : user.isVerified
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    // In production, this should check for admin authentication
    // For now, allowing access (add authentication middleware later)

    const users = await User.findAll({
      attributes: { exclude: ['secretCode'] }, // Don't expose secret codes
      order: [['createdAt', 'DESC']],
      limit: 100 // Limit results
    });

    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

export default router;

