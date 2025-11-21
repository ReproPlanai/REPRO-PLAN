import { Router, Request, Response } from 'express';
import { User } from '../models';

const router = Router();

// Get user profile
router.get('/:id', async (req: Request, res: Response) => {
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phoneNumber, isVerified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      phoneNumber: phoneNumber || user.phoneNumber,
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

export default router;

