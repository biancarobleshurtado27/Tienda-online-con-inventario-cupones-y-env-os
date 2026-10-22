import db from '../db.js';

export const productosService = {
  getAll({ search, categoria, orden } = {}) {
    let sql = 'SELECT * FROM productos WHERE activo = 1';
    const params = [];

    if (search) {
      sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoria && categoria !== 'Todas') {
      sql += ' AND categoria = ?';
      params.push(categoria);
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
    return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  },

  create({ nombre, descripcion, precio, stock, categoria, activo = 1 }) {
    if (!nombre || precio === undefined || stock === undefined || !categoria) {
      const err = new Error('Nombre, precio, stock y categoría son obligatorios');
      err.statusCode = 400;
      throw err;
    }

    if (Number(precio) <= 0) {
      const err = new Error('El precio debe ser mayor a 0');
      err.statusCode = 400;
      throw err;
    }

    if (Number(stock) < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, activo)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nombre.trim(), descripcion ? descripcion.trim() : null, Number(precio), Number(stock), categoria.trim(), activo ? 1 : 0);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { nombre, descripcion, precio, stock, categoria, activo }) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error(`Producto con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    if (precio !== undefined && Number(precio) <= 0) {
      const err = new Error('El precio debe ser mayor a 0');
      err.statusCode = 400;
      throw err;
    }

    if (stock !== undefined && Number(stock) < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    const newNombre = nombre !== undefined ? nombre.trim() : existing.nombre;
    const newDesc = descripcion !== undefined ? descripcion.trim() : existing.descripcion;
    const newPrecio = precio !== undefined ? Number(precio) : existing.precio;
    const newStock = stock !== undefined ? Number(stock) : existing.stock;
    const newCat = categoria !== undefined ? categoria.trim() : existing.categoria;
    const newActivo = activo !== undefined ? (activo ? 1 : 0) : existing.activo;

    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, activo = ?
      WHERE id = ?
    `);

    stmt.run(newNombre, newDesc, newPrecio, newStock, newCat, newActivo, id);
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error(`Producto con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    // Verificar si tiene órdenes asociadas
    const itemsCount = db.prepare('SELECT COUNT(*) as count FROM orden_items WHERE producto_id = ?').get(id).count;
    if (itemsCount > 0) {
      // Soft-delete para preservar integridad referencial histórica
      db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').run(id);
      return { message: 'Producto desactivado debido a que tiene órdenes asociadas', id, softDeleted: true };
    }

    db.prepare('DELETE FROM productos WHERE id = ?').run(id);
    return { message: 'Producto eliminado correctamente', id, softDeleted: false };
  }
};
