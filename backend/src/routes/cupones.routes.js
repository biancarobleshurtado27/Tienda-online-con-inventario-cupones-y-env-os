import { Router } from 'express';
import { cuponesController } from '../controllers/cupones.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Validación en vivo: accesible públicamente para que los clientes apliquen cupones
router.post('/validar', cuponesController.validar);

// CRUD de cupones: solo personal de tienda
router.get('/', requireAuth, requireRole('personal'), cuponesController.getAll);
router.get('/:id', requireAuth, requireRole('personal'), cuponesController.getById);
router.post('/', requireAuth, requireRole('personal'), cuponesController.create);
router.put('/:id', requireAuth, requireRole('personal'), cuponesController.update);
router.delete('/:id', requireAuth, requireRole('personal'), cuponesController.delete);

export default router;
