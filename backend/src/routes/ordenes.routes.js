import { Router } from 'express';
import { ordenesController } from '../controllers/ordenes.controller.js';

const router = Router();

// Rutas REST para órdenes
router.get('/', ordenesController.getAll);
router.get('/:id', ordenesController.getById);
router.post('/', ordenesController.create);
router.patch('/:id/estado', ordenesController.cambiarEstado);
router.patch('/:id/cancelar', ordenesController.cancelar);

export default router;
