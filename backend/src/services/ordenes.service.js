import db from '../db.js';
import { cuponesService } from './cupones.service.js';
import { clientesService } from './clientes.service.js';
import { isValidId, isValidQuantity } from '../utils/validators.js';

const MONTO_ENVIO_GRATIS = 50.00;

export const ordenesService = {
  getAll({ estado, cliente_id } = {}) {
    let sql = `
      SELECT o.*, 
             c.nombre AS cliente_nombre, 
             c.email AS cliente_email, 
             c.ciudad AS cliente_ciudad,
             cup.codigo AS cupon_codigo,
             cup.porcentaje AS cupon_porcentaje,
             (SELECT COUNT(*) FROM orden_items oi WHERE oi.orden_id = o.id) AS total_items
      FROM ordenes o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN cupones cup ON o.cupon_id = cup.id
      WHERE 1=1
    `;
    const params = [];

    if (estado && typeof estado === 'string' && estado !== 'todos') {
      sql += ' AND o.estado = ?';
      params.push(estado.trim());
    }

    if (cliente_id) {
      if (!isValidId(cliente_id)) {
        const err = new Error('El parámetro cliente_id debe ser un entero positivo');
        err.statusCode = 400;
        throw err;
      }
      sql += ' AND o.cliente_id = ?';
      params.push(Number(cliente_id));
    }

    sql += ' ORDER BY o.id DESC';

    return db.prepare(sql).all(...params);
  },

  getById(id) {
    if (!isValidId(id)) {
      return null;
    }

    const ordenSql = `
      SELECT o.*, 
             c.nombre AS cliente_nombre, 
             c.email AS cliente_email, 
             c.ciudad AS cliente_ciudad,
             cup.codigo AS cupon_codigo,
             cup.porcentaje AS cupon_porcentaje
      FROM ordenes o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN cupones cup ON o.cupon_id = cup.id
      WHERE o.id = ?
    `;

    const orden = db.prepare(ordenSql).get(Number(id));
    if (!orden) return null;

    const itemsSql = `
      SELECT oi.*, p.nombre AS producto_nombre, p.categoria AS producto_categoria
      FROM orden_items oi
      JOIN productos p ON oi.producto_id = p.id
      WHERE oi.orden_id = ?
    `;

    orden.items = db.prepare(itemsSql).all(Number(id));

    // Estructuras de objeto para cliente y cupón
    orden.cliente = {
      id: orden.cliente_id,
      nombre: orden.cliente_nombre,
      email: orden.cliente_email,
      ciudad: orden.cliente_ciudad
    };

    orden.cupon = orden.cupon_id ? {
      id: orden.cupon_id,
      codigo: orden.cupon_codigo,
      porcentaje: orden.cupon_porcentaje
    } : null;

    return orden;
  },

  /**
   * Crea una nueva orden aplicando:
   * 1. Consolidación de ítems repetidos y validación del total acumulado por producto
   * 2. Creación obligatoria en estado 'nueva' (sin bypass de estado)
   * 3. Validación estricta de IDs y cantidades numéricas enteras finitas > 0
   * 4. Manejo seguro de cupones y sin fallos de .trim()
   * 5. Transacción atómica en SQLite (sin descuentos parciales ante fallos)
   */
  crearOrden({ cliente_id, items, codigo_cupon, estado_inicial }) {
    // Validar estado_inicial: no permitir alterar el flujo inicial
    if (estado_inicial !== undefined && estado_inicial !== null && estado_inicial !== 'nueva') {
      const err = new Error("Una orden nueva debe crearse en estado 'nueva'");
      err.statusCode = 400;
      throw err;
    }

    if (!cliente_id || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Se requiere un cliente y al menos un producto en la orden');
      err.statusCode = 400;
      throw err;
    }

    if (!isValidId(cliente_id)) {
      const err = new Error('El campo cliente_id debe ser un entero positivo');
      err.statusCode = 400;
      throw err;
    }

    // Validar cliente
    const cliente = clientesService.getById(Number(cliente_id));
    if (!cliente) {
      const err = new Error(`El cliente con ID ${cliente_id} no existe`);
      err.statusCode = 404;
      throw err;
    }

    // Consolidar ítems repetidos del mismo producto acumulando su cantidad
    const itemsAgrupados = new Map();
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        const err = new Error('Cada ítem debe ser un objeto válido con producto_id y cantidad');
        err.statusCode = 400;
        throw err;
      }

      if (!isValidId(item.producto_id)) {
        const err = new Error('Cada producto debe tener un ID entero positivo');
        err.statusCode = 400;
        throw err;
      }

      if (!isValidQuantity(item.cantidad)) {
        const err = new Error('La cantidad de cada producto debe ser un número entero mayor a 0');
        err.statusCode = 400;
        throw err;
      }

      const prodId = Number(item.producto_id);
      const cant = Number(item.cantidad);
      itemsAgrupados.set(prodId, (itemsAgrupados.get(prodId) || 0) + cant);
    }

    // Validar código de cupón de forma segura si fue provisto
    if (codigo_cupon !== undefined && codigo_cupon !== null && typeof codigo_cupon !== 'string') {
      const err = new Error('El código de cupón debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    // Transacción atómica en SQLite con better-sqlite3
    const ejecutarTransaccionCreacion = db.transaction(() => {
      let subtotal = 0;
      const itemsProcesados = [];

      // 1. Validar y descontar stock para cada producto consolidado
      for (const [prodId, cant] of itemsAgrupados.entries()) {
        const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(prodId);
        if (!producto) {
          const err = new Error(`El producto con ID ${prodId} no existe`);
          err.statusCode = 404;
          throw err;
        }

        if (producto.activo !== 1) {
          const err = new Error(`El producto '${producto.nombre}' no se encuentra disponible`);
          err.statusCode = 409;
          throw err;
        }

        // Regla: No se puede pedir más que el stock disponible
        if (producto.stock < cant) {
          const err = new Error(`Stock insuficiente para '${producto.nombre}'. Stock disponible: ${producto.stock}, solicitado: ${cant}`);
          err.statusCode = 409;
          throw err;
        }

        // Descontar stock
        db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?').run(cant, prodId);

        const subtotalLinea = Number((cant * producto.precio).toFixed(2));
        subtotal += subtotalLinea;

        itemsProcesados.push({
          producto_id: prodId,
          cantidad: cant,
          precio_unitario: producto.precio
        });
      }

      subtotal = Number(subtotal.toFixed(2));

      // 2. Validar cupón de descuento si fue suministrado
      let cuponId = null;
      let descuento = 0.00;

      if (codigo_cupon && typeof codigo_cupon === 'string' && codigo_cupon.trim() !== '') {
        const cleanCupon = codigo_cupon.trim();
        const resultadoCupon = cuponesService.validarParaCliente(cleanCupon, Number(cliente_id), subtotal);
        if (resultadoCupon) {
          cuponId = resultadoCupon.cupon.id;
          descuento = resultadoCupon.descuento;
        }
      }

      // 3. Regla de Costo de Envío:
      // Depende de la ciudad y es GRATIS si (subtotal - descuento) >= $50.00
      const subtotalNeto = Math.max(0, Number((subtotal - descuento).toFixed(2)));
      let envio = 0.00;

      if (subtotalNeto < MONTO_ENVIO_GRATIS) {
        envio = clientesService.calcularCostoEnvio(cliente.ciudad);
      }

      const total = Number((subtotalNeto + envio).toFixed(2));
      const fecha = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // 4. Insertar la orden: SIEMPRE en estado 'nueva'
      const insertOrdenStmt = db.prepare(`
        INSERT INTO ordenes (cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total)
        VALUES (?, ?, 'nueva', ?, ?, ?, ?, ?)
      `);

      const resultOrden = insertOrdenStmt.run(
        Number(cliente_id),
        cuponId,
        fecha,
        subtotal,
        descuento,
        envio,
        total
      );

      const ordenId = resultOrden.lastInsertRowid;

      // 5. Insertar cada ítem consolidado
      const insertItemStmt = db.prepare(`
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
      `);

      for (const it of itemsProcesados) {
        insertItemStmt.run(ordenId, it.producto_id, it.cantidad, it.precio_unitario);
      }

      return ordenId;
    });

    const nuevoId = ejecutarTransaccionCreacion();
    return this.getById(nuevoId);
  },

  /**
   * Cambiar de estado una orden:
   * Flujo permitido: nueva -> pagada -> enviada -> entregada.
   */
  cambiarEstado(id, nuevoEstado) {
    if (!isValidId(id)) {
      const err = new Error('El ID de la orden debe ser un entero positivo');
      err.statusCode = 400;
      throw err;
    }

    if (typeof nuevoEstado !== 'string' || nuevoEstado.trim() === '') {
      const err = new Error("El campo 'estado' es requerido y debe ser una cadena de texto");
      err.statusCode = 400;
      throw err;
    }

    const estadoLimpio = nuevoEstado.trim().toLowerCase();

    const orden = this.getById(Number(id));
    if (!orden) {
      const err = new Error(`Orden con ID ${id} no encontrada`);
      err.statusCode = 404;
      throw err;
    }

    if (orden.estado === 'cancelada') {
      const err = new Error('No se puede cambiar el estado de una orden cancelada');
      err.statusCode = 409;
      throw err;
    }

    if (orden.estado === 'entregada') {
      const err = new Error('La orden ya ha sido entregada y se encuentra cerrada');
      err.statusCode = 409;
      throw err;
    }

    // Si la acción solicitada es cancelar, delegar a la función especializada
    if (estadoLimpio === 'cancelada') {
      return this.cancelarOrden(Number(id));
    }

    const transicionesValidas = {
      'nueva': ['pagada'],
      'pagada': ['enviada'],
      'enviada': ['entregada']
    };

    const permitidos = transicionesValidas[orden.estado] || [];
    if (!permitidos.includes(estadoLimpio)) {
      const err = new Error(`Transición inválida: no se puede pasar de '${orden.estado}' a '${estadoLimpio}'. Flujo permitido: nueva -> pagada -> enviada -> entregada`);
      err.statusCode = 409;
      throw err;
    }

    db.prepare('UPDATE ordenes SET estado = ? WHERE id = ?').run(estadoLimpio, Number(id));
    return this.getById(Number(id));
  },

  /**
   * Cancelar una orden:
   * Regla: Una orden solo se puede cancelar antes de ser enviada (en estado 'nueva' o 'pagada').
   * Al cancelarla se repone el stock de todos sus items dentro de una transacción atómica.
   */
  cancelarOrden(id) {
    if (!isValidId(id)) {
      const err = new Error('El ID de la orden debe ser un entero positivo');
      err.statusCode = 400;
      throw err;
    }

    const orden = this.getById(Number(id));
    if (!orden) {
      const err = new Error(`Orden con ID ${id} no encontrada`);
      err.statusCode = 404;
      throw err;
    }

    if (orden.estado === 'cancelada') {
      const err = new Error('La orden ya está cancelada');
      err.statusCode = 409;
      throw err;
    }

    // Regla de negocio: Una orden solo se puede cancelar antes de ser enviada
    if (orden.estado === 'enviada' || orden.estado === 'entregada') {
      const err = new Error(`No se puede cancelar una orden en estado '${orden.estado}'. Solo se permite cancelar órdenes antes de ser enviadas (en estado 'nueva' o 'pagada')`);
      err.statusCode = 409;
      throw err;
    }

    const ejecutarTransaccionCancelacion = db.transaction(() => {
      // 1. Reponer el stock de cada producto
      for (const item of orden.items) {
        db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?').run(
          item.cantidad,
          item.producto_id
        );
      }

      // 2. Marcar la orden como cancelada
      db.prepare("UPDATE ordenes SET estado = 'cancelada' WHERE id = ?").run(Number(id));
    });

    ejecutarTransaccionCancelacion();
    return this.getById(Number(id));
  }
};
