import { Router } from 'express';
import { ordenesController } from '../controllers/ordenes.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las operaciones con órdenes requieren autenticación
router.get('/', requireAuth, ordenesController.getAll);
router.get('/:id', requireAuth, ordenesController.getById);
router.post('/', requireAuth, ordenesController.create);

// Operaciones de gestión de órdenes: solo personal de tienda
router.patch('/:id/estado', requireAuth, requireRole('personal'), ordenesController.cambiarEstado);
router.patch('/:id/cancelar', requireAuth, requireRole('personal'), ordenesController.cancelar);

export default router;
