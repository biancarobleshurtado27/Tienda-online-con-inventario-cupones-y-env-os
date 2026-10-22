import { productosService } from '../services/productos.service.js';
import { isValidId } from '../utils/validators.js';

export const productosController = {
  getAll(req, res) {
    try {
      const { search, categoria, orden } = req.query;
      const productos = productosService.getAll({ search, categoria, orden });
      res.status(200).json(productos);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getAllAdmin(req, res) {
    try {
      const productos = productosService.getAllAdmin();
      res.status(200).json(productos);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getCategorias(req, res) {
    try {
      const categorias = productosService.getCategorias();
      res.status(200).json(categorias);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  getById(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del producto debe ser un entero positivo' });
      }
      const producto = productosService.getById(id);
      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }
      res.status(200).json(producto);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  create(req, res) {
    try {
      const nuevo = productosService.create(req.body || {});
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  update(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del producto debe ser un entero positivo' });
      }
      const actualizado = productosService.update(id, req.body || {});
      res.status(200).json(actualizado);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  delete(req, res) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'El ID del producto debe ser un entero positivo' });
      }
      const resultado = productosService.delete(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
