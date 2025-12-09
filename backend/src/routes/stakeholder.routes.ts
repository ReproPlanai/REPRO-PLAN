import { Router, Request, Response } from 'express';
import { Stakeholder, EmergencyAlert, Case, InterRoleMessage } from '../models/stakeholders';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { emailService } from '../services/emailService';
import { roleGuard } from '../middleware/roleGuard';
import { authGuard, signToken } from '../middleware/auth';

const router = Router();

// Generate unique secret code for stakeholders
const generateStakeholderCode = (role: string): string => {
  const prefix = 'REPROPLAN';
  const roleCode = role.substring(0, 4);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${roleCode}_${random}`;
};

// Stakeholder Registration
router.post(
  '/register',
  [
    body('role').isIn(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']).withMessage('Invalid role'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
    body('surveyLink').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Survey link must be a valid URL')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { role, phoneNumber, surveyLink, name, organization, email } = req.body;

      // Generate unique secret code
      let secretCode = generateStakeholderCode(role);
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const existing = await Stakeholder.findOne({ where: { secretCode } });
        if (!existing) break;
        secretCode = generateStakeholderCode(role);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique code. Please try again.'
        });
      }

      const stakeholder = await Stakeholder.create({
        role,
        secretCode,
        phoneNumber,
        surveyLink,
        name,
        organization,
        email,
        isActive: true,
        permissions: getDefaultPermissions(role)
      });

      // Send welcome email if email was provided
      if (email && email.trim()) {
        try {
          await emailService.sendRegistrationEmail(email, secretCode);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        }
      }

      const token = signToken({ id: stakeholder.id, role: stakeholder.role, type: 'stakeholder' });

      return res.status(201).json({
        success: true,
        message: 'Stakeholder registered successfully',
        stakeholder: {
          id: stakeholder.id,
          role: stakeholder.role,
          secretCode: stakeholder.secretCode
        },
        token
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error creating stakeholder',
        error: error.message
      });
    }
  }
);

// Get default permissions for each role
const getDefaultPermissions = (role: string): any => {
  const permissions: any = {
    ADMIN: {
      canViewAllData: true,
      canManageUsers: true,
      canManageStakeholders: true,
      canViewAllAlerts: true,
      canViewAllCases: true,
      canSendMessages: true,
      canAccessAnalytics: true
    },
    POLICE: {
      canViewAlerts: true,
      canCreateCases: true,
      canUpdateCases: true,
      canViewMap: true,
      canSendMessages: ['SAFEHOUSE', 'MEDICAL'],
      canViewEmergencyData: true
    },
    SAFEHOUSE: {
      canViewAlerts: true,
      canCreateCases: true,
      canUpdateCases: true,
      canManageResidents: true,
      canSendMessages: ['POLICE', 'MEDICAL', 'NGO'],
      canViewEmergencyData: true
    },
    MEDICAL: {
      canViewAlerts: true,
      canCreateCases: true,
      canUpdateCases: true,
      canViewHealthRecords: true,
      canSendMessages: ['POLICE', 'SAFEHOUSE', 'NGO'],
      canViewEmergencyData: true
    },
    NGO: {
      canViewAlerts: true,
      canCreateCases: true,
      canViewPrograms: true,
      canSendMessages: ['POLICE', 'SAFEHOUSE', 'MEDICAL'],
      canViewAnalytics: true
    }
  };
  return permissions[role] || {};
};

// Stakeholder Login
router.post(
  '/login',
  [
    body('secretCode').notEmpty().withMessage('Secret code is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { secretCode, phoneNumber } = req.body;

      const stakeholder = await Stakeholder.findOne({
        where: { secretCode, phoneNumber, isActive: true }
      });

      if (!stakeholder) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      await stakeholder.update({ lastLogin: new Date() });

      const token = signToken({ id: stakeholder.id, role: stakeholder.role, type: 'stakeholder' });

      return res.json({
        success: true,
        message: 'Login successful',
        stakeholder: {
          id: stakeholder.id,
          role: stakeholder.role,
          name: stakeholder.name,
          organization: stakeholder.organization,
          permissions: stakeholder.permissions
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

// Get all emergency alerts (filtered by role permissions)
router.get(
  '/alerts',
  authGuard,
  roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']),
  async (req: Request, res: Response) => {
    try {
      const { stakeholderId, status, priority } = req.query;
      const role = (req as any).user?.role;

      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (stakeholderId) where.stakeholderId = stakeholderId;

      // Role-based filtering
      if (role === 'POLICE') {
        // Police can see all alerts
      } else if (role === 'MEDICAL') {
        where.alertType = ['medical', 'gbv', 'panic'];
      } else if (role === 'SAFEHOUSE') {
        where.alertType = ['gbv', 'safety', 'panic'];
      } else if (role === 'NGO') {
        where.alertType = ['gbv', 'safety'];
      }

      const alerts = await EmergencyAlert.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      return res.json({
        success: true,
        alerts
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching alerts',
        error: error.message
      });
    }
  }
);

// Create emergency alert
router.post(
  '/alerts',
  authGuard,
  roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']),
  [
    body('alertType').isIn(['panic', 'medical', 'gbv', 'safety', 'other']).withMessage('Invalid alert type'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('location').isObject().withMessage('Location must be an object'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { alertType, priority, location, description, userId, stakeholderId } = req.body;

      const alert = await EmergencyAlert.create({
        alertType,
        priority,
        location,
        description,
        status: 'active',
        userId,
        stakeholderId
      });

      // Notify relevant roles based on alert type
      await notifyRelevantRoles(alert);

      return res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        alert
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error creating alert',
        error: error.message
      });
    }
  }
);

// Update alert status
router.put('/alerts/:id', authGuard, roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, assignedRole, responseTime } = req.body;

    const alert = await EmergencyAlert.findByPk(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.update({
      status: status || alert.status,
      assignedTo: assignedTo || alert.assignedTo,
      assignedRole: assignedRole || alert.assignedRole,
      responseTime: responseTime || alert.responseTime
    });

    return res.json({
      success: true,
      message: 'Alert updated successfully',
      alert
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
});

// Get all cases
router.get('/cases', authGuard, roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']), async (req: Request, res: Response) => {
  try {
    const { stakeholderId, status, priority } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (stakeholderId) where.assignedTo = stakeholderId;

    const cases = await Case.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    return res.json({
      success: true,
      cases
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching cases',
      error: error.message
    });
  }
});

// Create case
router.post(
  '/cases',
  authGuard,
  roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']),
  [
    body('caseType').notEmpty().withMessage('Case type is required'),
    body('location').isObject().withMessage('Location must be an object'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { caseType, location, description, priority, assignedTo, assignedRole, relatedAlerts, createdBy } = req.body;

      // Generate case number
      const caseNumber = `CASE-${new Date().getFullYear()}-${String(await Case.count() + 1).padStart(4, '0')}`;

      const caseRecord = await Case.create({
        caseNumber,
        caseType,
        location,
        description,
        priority: priority || 'medium',
        status: 'open',
        assignedTo,
        assignedRole,
        relatedAlerts: relatedAlerts || [],
        notes: [],
        createdBy
      });

      return res.status(201).json({
        success: true,
        message: 'Case created successfully',
        case: caseRecord
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error creating case',
        error: error.message
      });
    }
  }
);

// Update case
router.put('/cases/:id', authGuard, roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, assignedRole, notes } = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const updatedNotes = notes ? [...caseRecord.notes, { note: notes, timestamp: new Date() }] : caseRecord.notes;

    await caseRecord.update({
      status: status || caseRecord.status,
      priority: priority || caseRecord.priority,
      assignedTo: assignedTo !== undefined ? assignedTo : caseRecord.assignedTo,
      assignedRole: assignedRole || caseRecord.assignedRole,
      notes: updatedNotes
    });

    return res.json({
      success: true,
      message: 'Case updated successfully',
      case: caseRecord
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating case',
      error: error.message
    });
  }
});

// Inter-role messaging
router.post(
  '/messages',
  authGuard,
  roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']),
  [
    body('fromRole').notEmpty().withMessage('From role is required'),
    body('fromStakeholderId').isInt().withMessage('From stakeholder ID is required'),
    body('toRole').notEmpty().withMessage('To role is required'),
    body('messageType').isIn(['alert', 'request', 'update', 'notification', 'data_share']).withMessage('Invalid message type'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { fromRole, fromStakeholderId, toRole, toStakeholderId, messageType, subject, content, priority, relatedCaseId, relatedAlertId } = req.body;

      const message = await InterRoleMessage.create({
        fromRole,
        fromStakeholderId,
        toRole,
        toStakeholderId,
        messageType,
        subject,
        content,
        priority: priority || 'medium',
        relatedCaseId,
        relatedAlertId,
        isRead: false
      });

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        messageData: message
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error sending message',
        error: error.message
      });
    }
  }
);

// Get messages for a role
router.get('/messages', authGuard, roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']), async (req: Request, res: Response) => {
  try {
    const { toRole, toStakeholderId, isRead } = req.query;

    const where: any = {};
    if (toRole) where.toRole = toRole;
    if (toStakeholderId) where.toStakeholderId = toStakeholderId;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const messages = await InterRoleMessage.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    return res.json({
      success: true,
      messages
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// Mark message as read
router.put('/messages/:id/read', authGuard, roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await InterRoleMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.update({ isRead: true });

    return res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
});

// Helper function to notify relevant roles
const notifyRelevantRoles = async (alert: EmergencyAlert) => {
  const roleMapping: any = {
    panic: ['POLICE', 'SAFEHOUSE', 'MEDICAL'],
    medical: ['MEDICAL', 'POLICE'],
    gbv: ['POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'],
    safety: ['POLICE', 'SAFEHOUSE'],
    other: ['POLICE', 'ADMIN']
  };

  const rolesToNotify = roleMapping[alert.alertType] || ['POLICE'];

  // Create notifications for each role
  for (const role of rolesToNotify) {
    await InterRoleMessage.create({
      fromRole: 'SYSTEM',
      fromStakeholderId: 0,
      toRole: role,
      messageType: 'alert',
      subject: `New ${alert.alertType} Alert`,
      content: alert.description,
      relatedAlertId: alert.id,
      priority: alert.priority,
      isRead: false
    });
  }
};

export default router;

