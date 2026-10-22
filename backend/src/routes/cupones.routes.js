import { Router } from 'express';
import { cuponesController } from '../controllers/cupones.controller.js';

const router = Router();

// CRUD completo para cupones + validación en vivo
router.get('/', cuponesController.getAll);
router.post('/validar', cuponesController.validar);
router.get('/:id', cuponesController.getById);
router.post('/', cuponesController.create);
router.put('/:id', cuponesController.update);
router.delete('/:id', cuponesController.delete);

export default router;
