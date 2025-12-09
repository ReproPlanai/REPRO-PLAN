import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';
import clinicRoutes from './clinic.routes';
import stakeholderRoutes from './stakeholder.routes';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'REPRO PLAN API v3.0',
    version: '3.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/api/health',
      clinics: '/api/clinics',
      stakeholders: '/api/stakeholders'
    }
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', roleGuard(['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL']), healthRoutes);
router.use('/clinics', clinicRoutes);
router.use('/stakeholders', stakeholderRoutes);

export default router;

