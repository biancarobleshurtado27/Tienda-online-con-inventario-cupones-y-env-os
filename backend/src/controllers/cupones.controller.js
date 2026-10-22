import { cuponesService } from '../services/cupones.service.js';
import { isValidId } from '../utils/validators.js';

export const cuponesController = {
  getAll(req, res) {
    try {
      const cupones = cuponesService.getAll();
      res.status(200).json(cupones);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getById(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del cupón debe ser un entero positivo' });
      }
      const cupon = cuponesService.getById(id);
      if (!cupon) {
        return res.status(404).json({ error: `Cupón con ID ${id} no encontrado` });
      }
      res.status(200).json(cupon);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  create(req, res) {
    try {
      const nuevo = cuponesService.create(req.body || {});
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  update(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del cupón debe ser un entero positivo' });
      }
      const actualizado = cuponesService.update(id, req.body || {});
      res.status(200).json(actualizado);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  delete(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del cupón debe ser un entero positivo' });
      }
      const resultado = cuponesService.delete(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  validar(req, res) {
    try {
      const { codigo, cliente_id, subtotal } = req.body || {};
      if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
        return res.status(400).json({ error: 'El código de cupón es obligatorio y debe ser un texto' });
      }
      const resultado = cuponesService.validarParaCliente(codigo, cliente_id, subtotal || 0);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
