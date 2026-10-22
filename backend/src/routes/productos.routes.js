import { Router } from 'express';
import { productosController } from '../controllers/productos.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas de administración (deben ir antes de /:id para evitar colisiones)
router.get('/admin', requireAuth, requireRole('personal'), productosController.getAllAdmin);
router.post('/', requireAuth, requireRole('personal'), productosController.create);
router.put('/:id', requireAuth, requireRole('personal'), productosController.update);
router.delete('/:id', requireAuth, requireRole('personal'), productosController.delete);

// Rutas públicas (catálogo y detalle de productos activos)
router.get('/', productosController.getAll);
router.get('/categorias', productosController.getCategorias);
router.get('/:id', productosController.getById);

export default router;
