import { iaService } from '../services/ia.service.js';

export const iaController = {
  async generarDescripcion(req, res) {
    try {
      const { nombre, categoria } = req.body || {};
      const resultado = await iaService.generarDescripcion(nombre, categoria);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        ok: false,
        data: null,
        error: error.message
      });
    }
  },

  async recomendar(req, res) {
    try {
      const { carrito_ids, producto_ids } = req.body || {};
      const ids = carrito_ids || producto_ids || [];
      const resultado = await iaService.recomendarProductos(ids);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        ok: false,
        data: null,
        error: error.message
      });
    }
  }
};
