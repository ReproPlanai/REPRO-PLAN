import { Router, Request, Response } from 'express';
import { Clinic } from '../models';
import { body, validationResult } from 'express-validator';
import { roleGuard } from '../middleware/roleGuard';
import { authGuard } from '../middleware/auth';

const router = Router();

// Get all clinics
router.get('/', async (req: Request, res: Response) => {
  try {
    const clinics = await Clinic.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      clinics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clinics',
      error: error.message
    });
  }
});

// Get clinic by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findByPk(parseInt(id), {
      where: { isActive: true }
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      clinic
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clinic',
      error: error.message
    });
  }
});

// Create clinic (admin only)
router.post(
  '/',
  authGuard,
  roleGuard(['ADMIN']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('coordinates').isObject().withMessage('Coordinates are required'),
    body('services').isArray().withMessage('Services must be an array'),
    body('type').isIn(['clinic', 'hospital', 'counseling', 'emergency']).withMessage('Invalid clinic type')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const clinic = await Clinic.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Clinic created successfully',
        clinic
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating clinic',
        error: error.message
      });
    }
  }
);

// Update clinic (admin only)
router.put('/:id', authGuard, roleGuard(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findByPk(parseInt(id));

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    await clinic.update(req.body);

    res.json({
      success: true,
      message: 'Clinic updated successfully',
      clinic
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating clinic',
      error: error.message
    });
  }
});

export default router;

