import { Router } from 'express';
import { resumenController } from '../controllers/resumen.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint de métricas calculado con SQL: solo personal
router.get('/', requireAuth, requireRole('personal'), resumenController.getResumen);

export default router;
