import db from '../db.js';

export const cuponesService = {
  getAll() {
    // Retorna los cupones junto con la cantidad de usos reales en órdenes no canceladas
    const sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM ordenes o WHERE o.cupon_id = c.id AND o.estado != 'cancelada') AS usos_actuales
      FROM cupones c
      ORDER BY c.id DESC
    `;
    return db.prepare(sql).all();
  },

  getById(id) {
    const sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM ordenes o WHERE o.cupon_id = c.id AND o.estado != 'cancelada') AS usos_actuales
      FROM cupones c
      WHERE c.id = ?
    `;
    return db.prepare(sql).get(id);
  },

  getByCodigo(codigo) {
    return db.prepare('SELECT * FROM cupones WHERE UPPER(codigo) = UPPER(?)').get(codigo.trim());
  },

  create({ codigo, porcentaje, vigente_hasta, usos_maximos }) {
    if (!codigo || porcentaje === undefined || !vigente_hasta || usos_maximos === undefined) {
      const err = new Error('Código, porcentaje, fecha de vigencia y usos máximos son obligatorios');
      err.statusCode = 400;
      throw err;
    }

    const cleanCodigo = codigo.trim().toUpperCase();
    const cleanPorcentaje = Number(porcentaje);
    const cleanUsos = Number(usos_maximos);

    if (cleanPorcentaje <= 0 || cleanPorcentaje > 100) {
      const err = new Error('El porcentaje debe estar entre 1 y 100');
      err.statusCode = 400;
      throw err;
    }

    if (cleanUsos <= 0) {
      const err = new Error('Los usos máximos deben ser mayores a 0');
      err.statusCode = 400;
      throw err;
    }

    // Verificar unicidad de código
    const existing = this.getByCodigo(cleanCodigo);
    if (existing) {
      const err = new Error(`El cupón con código '${cleanCodigo}' ya existe`);
      err.statusCode = 409;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO cupones (codigo, porcentaje, vigente_hasta, usos_maximos)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(cleanCodigo, cleanPorcentaje, vigente_hasta.trim(), cleanUsos);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { codigo, porcentaje, vigente_hasta, usos_maximos }) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error(`Cupón con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    const newCodigo = codigo ? codigo.trim().toUpperCase() : existing.codigo;
    const newPorcentaje = porcentaje !== undefined ? Number(porcentaje) : existing.porcentaje;
    const newVigente = vigente_hasta ? vigente_hasta.trim() : existing.vigente_hasta;
    const newUsos = usos_maximos !== undefined ? Number(usos_maximos) : existing.usos_maximos;

    if (newPorcentaje <= 0 || newPorcentaje > 100) {
      const err = new Error('El porcentaje debe estar entre 1 y 100');
      err.statusCode = 400;
      throw err;
    }

    if (newUsos <= 0) {
      const err = new Error('Los usos máximos deben ser mayores a 0');
      err.statusCode = 400;
      throw err;
    }

    // Verificar si el nuevo código colisiona con otro id
    if (newCodigo !== existing.codigo) {
      const duplicate = db.prepare('SELECT id FROM cupones WHERE UPPER(codigo) = UPPER(?) AND id != ?').get(newCodigo, id);
      if (duplicate) {
        const err = new Error(`El código '${newCodigo}' ya está en uso por otro cupón`);
        err.statusCode = 409;
        throw err;
      }
    }

    const stmt = db.prepare(`
      UPDATE cupones
      SET codigo = ?, porcentaje = ?, vigente_hasta = ?, usos_maximos = ?
      WHERE id = ?
    `);

    stmt.run(newCodigo, newPorcentaje, newVigente, newUsos, id);
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error(`Cupón con ID ${id} no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    // Comprobar si hay órdenes asociadas
    const count = db.prepare('SELECT COUNT(*) as count FROM ordenes WHERE cupon_id = ?').get(id).count;
    if (count > 0) {
      const err = new Error('No se puede eliminar el cupón porque ya ha sido registrado en órdenes históricas');
      err.statusCode = 409;
      throw err;
    }

    db.prepare('DELETE FROM cupones WHERE id = ?').run(id);
    return { message: 'Cupón eliminado correctamente', id };
  },

  /**
   * Valida un cupón de acuerdo con las reglas de negocio:
   * 1. Debe existir.
   * 2. Debe estar vigente (vigente_hasta >= hoy).
   * 3. No haber superado usos_maximos en órdenes no canceladas.
   * 4. El cliente no debe haberlo usado previamente en órdenes no canceladas.
   */
  validarParaCliente(codigo, clienteId, subtotal = 0) {
    if (!codigo) return null;

    const cupon = this.getByCodigo(codigo);
    if (!cupon) {
      const err = new Error(`El cupón '${codigo}' no existe`);
      err.statusCode = 409;
      throw err;
    }

    // Fecha actual formato YYYY-MM-DD
    const hoy = new Date().toISOString().slice(0, 10);
    if (cupon.vigente_hasta < hoy) {
      const err = new Error(`El cupón '${cupon.codigo}' venció el ${cupon.vigente_hasta}`);
      err.statusCode = 409;
      throw err;
    }

    // Contar usos totales no cancelados
    const totalUsos = db.prepare(`
      SELECT COUNT(*) as count FROM ordenes
      WHERE cupon_id = ? AND estado != 'cancelada'
    `).get(cupon.id).count;

    if (totalUsos >= cupon.usos_maximos) {
      const err = new Error(`El cupón '${cupon.codigo}' ha alcanzado su límite de ${cupon.usos_maximos} usos`);
      err.statusCode = 409;
      throw err;
    }

    // Verificar si el cliente ya lo utilizó en una orden no cancelada
    if (clienteId) {
      const usoCliente = db.prepare(`
        SELECT COUNT(*) as count FROM ordenes
        WHERE cupon_id = ? AND cliente_id = ? AND estado != 'cancelada'
      `).get(cupon.id, clienteId).count;

      if (usoCliente > 0) {
        const err = new Error(`El cliente ya ha utilizado el cupón '${cupon.codigo}' anteriormente`);
        err.statusCode = 409;
        throw err;
      }
    }

    const descuento = Number(((subtotal * cupon.porcentaje) / 100).toFixed(2));

    return {
      cupon,
      descuento,
      porcentaje: cupon.porcentaje,
      valido: true
    };
  }
};
