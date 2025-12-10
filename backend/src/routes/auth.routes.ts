import { Router, Request, Response } from 'express';
import { User } from '../models';
import { Stakeholder } from '../models/stakeholders';
import { body, validationResult } from 'express-validator';
import { signToken } from '../middleware/auth';
import * as crypto from 'crypto';

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

// Generate a unique survey link for account recovery
const generateSurveyLink = (): string => {
  const baseUrl = process.env.FRONTEND_URL || 'https://repro-plan.netlify.app';
  const recoveryPath = '/recover';
  const uniqueId = crypto.randomBytes(16).toString('hex');
  return `${baseUrl}${recoveryPath}?token=${uniqueId}`;
};

// Recovery endpoint - GET /auth/recover?token=...
const handleRecovery = async (_req: Request, res: Response) => {
  try {
    const { token } = _req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recovery token'
      });
    }

    // Find user by survey link token
    const surveyLinkPattern = `%token=${token}`;
    const user = await User.findOne({
      where: {
        surveyLink: {
          [require('sequelize').Op.like]: surveyLinkPattern
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Recovery link not found or expired'
      });
    }

    // Generate new secret code
    let newSecretCode = generateSecretCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existingUser = await User.findOne({ where: { secretCode: newSecretCode } });
      const existingStakeholder = await Stakeholder.findOne({ where: { secretCode: newSecretCode } });

      if (!existingUser && !existingStakeholder) {
        break;
      }
      newSecretCode = generateSecretCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate new code. Please try again.'
      });
    }

    // Update user's secret code
    await user.update({ secretCode: newSecretCode });

    return res.json({
      success: true,
      message: 'Account recovered successfully',
      newSecretCode,
      surveyLink: user.surveyLink
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Recovery failed',
      error: error.message
    });
  }
};

// Create secret code (anonymous registration)
router.post(
  '/register',
  [], // No validation needed - survey link is auto-generated
  async (_req: Request, res: Response) => {
    try {
      console.log('🔐 Starting user registration...');
      // Generate unique secret code
      console.log('🔑 Generating secret code...');
      let secretCode = generateSecretCode();
      console.log('🔑 Generated secret code:', secretCode);
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure code is unique
      console.log('🔍 Checking code uniqueness...');
      while (attempts < maxAttempts) {
        console.log('🔍 Attempt', attempts + 1, 'checking code:', secretCode);
        const existingUser = await User.findOne({ where: { secretCode } });
        console.log('🔍 Database query result:', existingUser ? 'Found existing user' : 'Code is unique');
        if (!existingUser) {
          break;
        }
        console.log('🔄 Code exists, generating new one...');
        secretCode = generateSecretCode();
        console.log('🔑 New secret code:', secretCode);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique code. Please try again.'
        });
      }

      // Generate unique survey link for account recovery
      console.log('🔗 Generating survey link...');
      let surveyLink = generateSurveyLink();
      console.log('🔗 Initial survey link:', surveyLink);
      let linkAttempts = 0;

      // Ensure survey link is unique
      while (linkAttempts < maxAttempts) {
        const existingUserWithLink = await User.findOne({ where: { surveyLink } });
        if (!existingUserWithLink) {
          break;
        }
        surveyLink = generateSurveyLink();
        linkAttempts++;
      }

      if (linkAttempts >= maxAttempts) {
        console.error('❌ Failed to generate unique survey link after', maxAttempts, 'attempts');
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique survey link. Please try again.'
        });
      }

      console.log('✅ Final survey link:', surveyLink);

      // Create new user with auto-generated secret code and survey link
      console.log('👤 Creating user with secretCode:', secretCode, 'surveyLink:', surveyLink);
      const user = await User.create({
        secretCode,
        surveyLink,
        isVerified: false,
        isUsed: false
      });

      console.log('✅ User created successfully:', user.id);

      const token = signToken({ id: user.id, role: 'USER', type: 'user' });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: user.id,
        secretCode: user.secretCode,
        surveyLink: user.surveyLink, // Auto-generated recovery link
        token
      });
    } catch (error: any) {
      console.error('❌ Error creating user:', error?.message || error, error?.stack);
      return res.status(500).json({
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

      const token = signToken({ id: user.id, role: 'USER', type: 'user' });

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          isVerified: user.isVerified
        },
        token
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }
);

// Recover account using survey link token - GET endpoint
router.get('/recover', handleRecovery);

// Regenerate secret code using survey link (legacy endpoint)
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

      // Find user by survey link first
      let account: User | Stakeholder | null = await User.findOne({
        where: { surveyLink },
        order: [['createdAt', 'DESC']] // Get the most recent user with this survey link
      });

      let accountType = 'user';

      // If no user found, check stakeholders
      if (!account) {
        account = await Stakeholder.findOne({
          where: { surveyLink },
          order: [['createdAt', 'DESC']] // Get the most recent stakeholder with this survey link
        });
        accountType = 'stakeholder';
      }

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this survey link. For anonymous users, recovery is only possible if you provided a survey link during registration.'
        });
      }

      // Generate new unique secret code
      let newSecretCode = generateSecretCode();
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        // Check both users and stakeholders for unique secret code
        const existingUser = await User.findOne({ where: { secretCode: newSecretCode } });
        const existingStakeholder = await Stakeholder.findOne({ where: { secretCode: newSecretCode } });

        if (!existingUser && !existingStakeholder) {
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

      // Update account with new code
      if (accountType === 'user') {
        await (account as any).update({
        secretCode: newSecretCode,
        isUsed: false,
        lastLogin: null
        });
      } else {
        // For stakeholders, just update the secret code (no isUsed field)
        await (account as any).update({
          secretCode: newSecretCode,
          lastLogin: null
        });
      }

      const token = signToken({
        id: account.id,
        role: accountType === 'user' ? 'USER' : (account as any).role || 'STAKEHOLDER',
        type: accountType === 'user' ? 'user' : 'stakeholder'
      });

      return res.json({
        success: true,
        message: 'New secret code generated successfully',
        secretCode: newSecretCode,
        accountId: account.id,
        accountType,
        token
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error regenerating code',
        error: error.message
      });
    }
  }
);

export default router;

