import { Router } from 'express';
import { clientesController } from '../controllers/clientes.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta pública para calcular costo de envío en checkout / carrito
router.get('/calcular-envio', clientesController.calcularEnvio);

// Rutas protegidas: solo personal de tienda puede consultar clientes y administrarlos
router.get('/', requireAuth, requireRole('personal'), clientesController.getAll);
router.get('/:id', requireAuth, requireRole('personal'), clientesController.getById);
router.post('/', requireAuth, requireRole('personal'), clientesController.create);

export default router;
