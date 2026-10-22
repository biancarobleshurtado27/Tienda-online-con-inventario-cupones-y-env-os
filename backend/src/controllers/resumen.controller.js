import { resumenService } from '../services/resumen.service.js';

export const resumenController = {
  getResumen(req, res) {
    try {
      const metricas = resumenService.getMetricas();
      res.status(200).json(metricas);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
