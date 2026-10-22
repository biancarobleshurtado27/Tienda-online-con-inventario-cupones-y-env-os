import { ordenesService } from '../services/ordenes.service.js';

export const ordenesController = {
  getAll(req, res) {
    try {
      const { estado, cliente_id } = req.query;
      const ordenes = ordenesService.getAll({ estado, cliente_id });
      res.status(200).json(ordenes);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getById(req, res) {
    try {
      const { id } = req.params;
      const orden = ordenesService.getById(id);
      if (!orden) {
        return res.status(404).json({ error: `Orden con ID ${id} no encontrada` });
      }
      res.status(200).json(orden);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  create(req, res) {
    try {
      const { cliente_id, items, codigo_cupon, estado_inicial } = req.body;
      const nuevaOrden = ordenesService.crearOrden({
        cliente_id,
        items,
        codigo_cupon,
        estado_inicial
      });
      res.status(201).json(nuevaOrden);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ error: "El campo 'estado' es requerido" });
      }
      const ordenActualizada = ordenesService.cambiarEstado(id, estado);
      res.status(200).json(ordenActualizada);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  cancelar(req, res) {
    try {
      const { id } = req.params;
      const ordenCancelada = ordenesService.cancelarOrden(id);
      res.status(200).json({
        message: 'Orden cancelada con éxito y stock repuesto en inventario',
        orden: ordenCancelada
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
