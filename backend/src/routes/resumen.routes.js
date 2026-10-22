import { Router } from 'express';
import { resumenController } from '../controllers/resumen.controller.js';

const router = Router();

// Endpoint de métricas calculado con SQL (SUM, COUNT, GROUP BY)
router.get('/', resumenController.getResumen);

export default router;
