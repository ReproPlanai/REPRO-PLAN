import { Router, Request, Response } from 'express';
import { User } from '../models';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = Router();

// Generate a unique secret code
const generateSecretCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create secret code (anonymous registration)
router.post(
  '/register',
  [
    body('surveyLink').notEmpty().withMessage('Survey link is required'),
    body('surveyLink').isURL().withMessage('Survey link must be a valid URL')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { surveyLink, demographics } = req.body;

      // Generate unique secret code
      let secretCode = generateSecretCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure code is unique
      while (attempts < maxAttempts) {
        const existingUser = await User.findOne({ where: { secretCode } });
        if (!existingUser) {
          break;
        }
        secretCode = generateSecretCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique code. Please try again.'
        });
      }

      // Create new user with secret code and survey link
      const user = await User.create({
        secretCode,
        surveyLink,
        isVerified: false,
        isUsed: false
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: user.id,
        secretCode: user.secretCode
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }
);

// Login with secret code (one-time use)
router.post(
  '/login',
  [
    body('secretCode').notEmpty().withMessage('Secret code is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { secretCode } = req.body;

      const user = await User.findOne({ where: { secretCode } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid secret code'
        });
      }

      // Check if code has already been used
      if (user.isUsed) {
        return res.status(403).json({
          success: false,
          message: 'This code has already been used. Secret codes can only be used once for security. Please use your survey link to generate a new code.'
        });
      }

      // Mark code as used and update last login
      await user.update({ 
        isUsed: true,
        lastLogin: new Date() 
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          isVerified: user.isVerified
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }
);

// Regenerate secret code using survey link
router.post(
  '/forget-code',
  [
    body('surveyLink').notEmpty().withMessage('Survey link is required'),
    body('surveyLink').isURL().withMessage('Survey link must be a valid URL')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { surveyLink } = req.body;

      // Find user by survey link
      const user = await User.findOne({ 
        where: { surveyLink },
        order: [['createdAt', 'DESC']] // Get the most recent user with this survey link
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this survey link. Please create a new account.'
        });
      }

      // Generate new unique secret code
      let newSecretCode = generateSecretCode();
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const existingUser = await User.findOne({ where: { secretCode: newSecretCode } });
        if (!existingUser) {
          break;
        }
        newSecretCode = generateSecretCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique code. Please try again.'
        });
      }

      // Update user with new code and reset usage
      await user.update({
        secretCode: newSecretCode,
        isUsed: false,
        lastLogin: null
      });

      res.json({
        success: true,
        message: 'New secret code generated successfully',
        secretCode: newSecretCode,
        userId: user.id
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error regenerating code',
        error: error.message
      });
    }
  }
);

export default router;

