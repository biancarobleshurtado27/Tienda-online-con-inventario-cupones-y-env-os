import db from '../db.js';

export const resumenService = {
  getMetricas() {
    // 1. Ventas por categoría (SUM y GROUP BY excluyendo órdenes canceladas)
    const ventasPorCategoriaSql = `
      SELECT p.categoria, 
             ROUND(SUM(oi.cantidad * oi.precio_unitario), 2) AS total_ventas,
             SUM(oi.cantidad) AS unidades_vendidas
      FROM orden_items oi
      JOIN ordenes o ON oi.orden_id = o.id
      JOIN productos p ON oi.producto_id = p.id
      WHERE o.estado != 'cancelada'
      GROUP BY p.categoria
      ORDER BY total_ventas DESC
    `;
    const ventasPorCategoria = db.prepare(ventasPorCategoriaSql).all();

    // 2. Los 3 productos más vendidos
    const top3ProductosSql = `
      SELECT p.id, 
             p.nombre, 
             p.categoria,
             p.stock,
             SUM(oi.cantidad) AS total_vendido,
             ROUND(SUM(oi.cantidad * oi.precio_unitario), 2) AS ingresos_generados
      FROM orden_items oi
      JOIN ordenes o ON oi.orden_id = o.id
      JOIN productos p ON oi.producto_id = p.id
      WHERE o.estado != 'cancelada'
      GROUP BY p.id, p.nombre, p.categoria, p.stock
      ORDER BY total_vendido DESC
      LIMIT 3
    `;
    const top3Productos = db.prepare(top3ProductosSql).all();

    // 3. Valor promedio por orden y totales generales
    const totalesSql = `
      SELECT 
        COUNT(*) AS total_ordenes,
        ROUND(COALESCE(AVG(total), 0), 2) AS valor_promedio_orden,
        ROUND(COALESCE(SUM(total), 0), 2) AS total_ingresos,
        ROUND(COALESCE(SUM(descuento), 0), 2) AS total_descuentos_otorgados,
        ROUND(COALESCE(SUM(envio), 0), 2) AS total_recaudo_envios
      FROM ordenes
      WHERE estado != 'cancelada'
    `;
    const totales = db.prepare(totalesSql).get();

    // 4. Conteo de órdenes por estado
    const ordenesPorEstadoSql = `
      SELECT estado, COUNT(*) as cantidad
      FROM ordenes
      GROUP BY estado
    `;
    const ordenesPorEstado = db.prepare(ordenesPorEstadoSql).all();

    // 5. Reto opcional: Alertas de reposición de inventario
    // Productos con stock <= 5 o con bajo stock comparado a ventas
    const alertasStockSql = `
      SELECT p.id, p.nombre, p.stock, p.categoria,
             COALESCE(SUM(oi.cantidad), 0) AS ventas_recientes,
             CASE 
               WHEN p.stock = 0 THEN 'Agotado'
               WHEN p.stock <= 5 THEN 'Crítico'
               WHEN p.stock <= 10 THEN 'Bajo'
               ELSE 'Adecuado'
             END AS nivel_alerta
      FROM productos p
      LEFT JOIN orden_items oi ON p.id = oi.producto_id
      LEFT JOIN ordenes o ON oi.orden_id = o.id AND o.estado != 'cancelada'
      WHERE p.activo = 1
      GROUP BY p.id, p.nombre, p.stock, p.categoria
      HAVING p.stock <= 10
      ORDER BY p.stock ASC
    `;
    const alertasStock = db.prepare(alertasStockSql).all();

    return {
      // Campos raíz (compatibles con test_endpoints.js)
      valor_promedio_orden: totales.valor_promedio_orden,
      total_ingresos: totales.total_ingresos,
      total_ordenes_activas: totales.total_ordenes,
      total_descuentos_otorgados: totales.total_descuentos_otorgados,
      total_recaudo_envios: totales.total_recaudo_envios,
      
      // Objeto anidado totales (consumido por DashboardPage.jsx)
      totales: {
        total_ingresos: totales.total_ingresos,
        valor_promedio_orden: totales.valor_promedio_orden,
        total_ordenes: totales.total_ordenes,
        total_descuentos_otorgados: totales.total_descuentos_otorgados,
        total_recaudo_envios: totales.total_recaudo_envios
      },
      
      ventas_por_categoria: ventasPorCategoria,
      top3_productos: top3Productos,
      top_3_productos_mas_vendidos: top3Productos, // Alias para DashboardPage
      ordenes_por_estado: ordenesPorEstado,
      alertas_reposicion: alertasStock,
      alertas_reposicion_stock: alertasStock // Alias para DashboardPage
    };
  }
};
