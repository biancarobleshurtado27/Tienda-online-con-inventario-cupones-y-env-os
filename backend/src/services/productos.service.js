import db from '../db.js';
import { isValidId, isValidPrice, isValidStock, isNonEmptyString, safeTrim } from '../utils/validators.js';

export const productosService = {
  getAll({ search, categoria, orden } = {}) {
    let sql = 'SELECT * FROM productos WHERE activo = 1';
    const params = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      const cleanSearch = search.trim();
      sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
      params.push(`%${cleanSearch}%`, `%${cleanSearch}%`);
    }

    if (categoria && typeof categoria === 'string' && categoria.trim() !== '' && categoria !== 'Todas') {
      sql += ' AND categoria = ?';
      params.push(categoria.trim());
    }

    // Criterio de ordenamiento
    if (orden === 'precio_asc') {
      sql += ' ORDER BY precio ASC';
    } else if (orden === 'precio_desc') {
      sql += ' ORDER BY precio DESC';
    } else if (orden === 'nombre_asc') {
      sql += ' ORDER BY nombre ASC';
    } else if (orden === 'stock_desc') {
      sql += ' ORDER BY stock DESC';
    } else {
      sql += ' ORDER BY id DESC';
    }

    return db.prepare(sql).all(...params);
  },

  getAllAdmin() {
    return db.prepare('SELECT * FROM productos ORDER BY id DESC').all();
  },

  getCategorias() {
    const rows = db.prepare('SELECT DISTINCT categoria FROM productos ORDER BY categoria ASC').all();
    return rows.map(r => r.categoria);
  },

  getById(id) {
    if (!isValidId(id)) {
      return null;
    }
    return db.prepare('SELECT * FROM productos WHERE id = ?').get(Number(id));
  },

  create({ nombre, descripcion, precio, stock, categoria, activo = 1 }) {
    if (!isNonEmptyString(nombre)) {
      const err = new Error('El nombre del producto es obligatorio y debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(categoria)) {
      const err = new Error('La categoría del producto es obligatoria y debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
      const err = new Error('La descripción debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    if (!isValidPrice(precio)) {
      const err = new Error('El precio debe ser un número positivo finito mayor a 0');
      err.statusCode = 400;
      throw err;
    }

    if (!isValidStock(stock)) {
      const err = new Error('El stock debe ser un número entero no negativo (>= 0)');
      err.statusCode = 400;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, activo)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const cleanNombre = nombre.trim();
    const cleanDesc = descripcion ? descripcion.trim() : null;
    const cleanPrecio = Number(precio);
    const cleanStock = Number(stock);
    const cleanCat = categoria.trim();
    const cleanActivo = activo ? 1 : 0;

    const result = stmt.run(cleanNombre, cleanDesc, cleanPrecio, cleanStock, cleanCat, cleanActivo);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { nombre, descripcion, precio, stock, categoria, activo }) {
    if (!isValidId(id)) {
      const err = new Error('El ID del producto debe ser un entero positivo');
      err.statusCode = 400;
      throw err;
    }

    const existing = this.getById(Number(id));
    if (!existing) {
      const err = new Error(`Producto con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    if (nombre !== undefined) {
      if (!isNonEmptyString(nombre)) {
        const err = new Error('El nombre del producto debe ser una cadena de texto no vacía');
        err.statusCode = 400;
        throw err;
      }
    }

    if (categoria !== undefined) {
      if (!isNonEmptyString(categoria)) {
        const err = new Error('La categoría debe ser una cadena de texto no vacía');
        err.statusCode = 400;
        throw err;
      }
    }

    if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
      const err = new Error('La descripción debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    if (precio !== undefined) {
      if (!isValidPrice(precio)) {
        const err = new Error('El precio debe ser un número positivo finito mayor a 0');
        err.statusCode = 400;
        throw err;
      }
    }

    if (stock !== undefined) {
      if (!isValidStock(stock)) {
        const err = new Error('El stock debe ser un número entero no negativo (>= 0)');
        err.statusCode = 400;
        throw err;
      }
    }

    const newNombre = nombre !== undefined ? nombre.trim() : existing.nombre;
    const newDesc = descripcion !== undefined ? (descripcion ? descripcion.trim() : null) : existing.descripcion;
    const newPrecio = precio !== undefined ? Number(precio) : existing.precio;
    const newStock = stock !== undefined ? Number(stock) : existing.stock;
    const newCat = categoria !== undefined ? categoria.trim() : existing.categoria;
    const newActivo = activo !== undefined ? (activo ? 1 : 0) : existing.activo;

    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, activo = ?
      WHERE id = ?
    `);

    stmt.run(newNombre, newDesc, newPrecio, newStock, newCat, newActivo, Number(id));
    return this.getById(Number(id));
  },

  delete(id) {
    if (!isValidId(id)) {
      const err = new Error('El ID del producto debe ser un entero positivo');
      err.statusCode = 400;
      throw err;
    }

    const existing = this.getById(Number(id));
    if (!existing) {
      const err = new Error(`Producto con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    // Verificar si tiene órdenes asociadas
    const itemsCount = db.prepare('SELECT COUNT(*) as count FROM orden_items WHERE producto_id = ?').get(Number(id)).count;
    if (itemsCount > 0) {
      // Soft-delete para preservar integridad referencial histórica
      db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').run(Number(id));
      return { message: 'Producto desactivado debido a que tiene órdenes asociadas', id: Number(id), softDeleted: true };
    }

    db.prepare('DELETE FROM productos WHERE id = ?').run(Number(id));
    return { message: 'Producto eliminado correctamente', id: Number(id), softDeleted: false };
  }
};
