import { Router } from 'express';
import { iaController } from '../controllers/ia.controller.js';

const router = Router();

// Endpoints para el agente de IA
router.post('/generar-descripcion', iaController.generarDescripcion);
router.post('/recomendar', iaController.recomendar);

export default router;
