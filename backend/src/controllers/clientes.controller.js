import { clientesService } from '../services/clientes.service.js';

export const clientesController = {
  getAll(req, res) {
    try {
      const clientes = clientesService.getAll();
      res.status(200).json(clientes);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getById(req, res) {
    try {
      const { id } = req.params;
      const cliente = clientesService.getById(id);
      if (!cliente) {
        return res.status(404).json({ error: `Cliente con ID ${id} no encontrado` });
      }
      res.status(200).json(cliente);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  create(req, res) {
    try {
      const nuevo = clientesService.create(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  calcularEnvio(req, res) {
    try {
      const { ciudad } = req.query;
      const costo = clientesService.calcularCostoEnvio(ciudad);
      res.status(200).json({ ciudad: ciudad || 'Por defecto', costo_envio: costo });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
