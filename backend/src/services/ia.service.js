import db from '../db.js';

export const iaService = {
  /**
   * Genera una descripción comercial atractiva y técnica
   * para un producto dado su nombre y categoría.
   */
  async generarDescripcion(nombre, categoria) {
    if (!nombre || !categoria) {
      const err = new Error('Nombre y categoría son requeridos para la IA');
      err.statusCode = 400;
      throw err;
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generar_descripcion',
            nombre,
            categoria
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json && (json.ok !== undefined || json.data !== undefined)) {
            return json;
          }
        }
      } catch (err) {
        console.warn('[IA Service] No se pudo contactar n8n webhook, usando motor local de IA/reglas:', err.message);
      }
    }

    // Generador inteligente de fallback con el mismo contrato { ok, data, error }
    const templates = {
      'Periféricos': `Potencia tu productividad y estación de juego con el nuevo ${nombre}. Diseñado con materiales premium para máxima durabilidad, respuesta inmediata y confort ergonómico en jornadas intensas.`,
      'Audio': `Experimenta una inmersión acústica inigualable con ${nombre}. Calidad de sonido de alta fidelidad, graves profundos y nitidez cristalina para música, llamadas y streaming.`,
      'Monitores': `Lleva tu experiencia visual al siguiente nivel con ${nombre}. Excelente reproducción de color, fluidez visual y ángulos de visión amplios que cuidan tu vista.`,
      'Accesorios': `Optimiza tu espacio de trabajo y rendimiento diario con ${nombre}. Estructura confiable, diseño minimalista y máxima versatilidad.`
    };

    const descripcion = templates[categoria] || `Descubre el nuevo ${nombre}, diseñado especialmente para la categoría ${categoria} con el balance perfecto entre rendimiento, diseño y durabilidad.`;

    return {
      ok: true,
      data: {
        nombre,
        categoria,
        descripcion_generada: descripcion,
        fuente: 'Asistente IA (Tienda Copilot)'
      },
      error: null
    };
  },

  /**
   * Recomienda productos relacionados con los que el cliente tiene en el carrito
   */
  async recomendarProductos(carritoProductoIds = []) {
    const ids = Array.isArray(carritoProductoIds) 
      ? carritoProductoIds.map(Number).filter(n => !isNaN(n))
      : [];

    // Obtener categorías presentes en el carrito
    let categoriasEnCarrito = [];
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const rows = db.prepare(`SELECT DISTINCT categoria FROM productos WHERE id IN (${placeholders})`).all(...ids);
      categoriasEnCarrito = rows.map(r => r.categoria);
    }

    // Buscar productos complementarios en stock que no estén en el carrito
    let recomendados = [];
    if (categoriasEnCarrito.length > 0) {
      const catPlaceholders = categoriasEnCarrito.map(() => '?').join(',');
      const idPlaceholders = ids.map(() => '?').join(',');
      
      recomendados = db.prepare(`
        SELECT id, nombre, descripcion, precio, stock, categoria
        FROM productos
        WHERE stock > 0 AND activo = 1
          AND id NOT IN (${idPlaceholders})
          AND categoria IN (${catPlaceholders})
        ORDER BY precio ASC
        LIMIT 3
      `).all(...ids, ...categoriasEnCarrito);
    }

    // Si aún faltan recomendaciones, completar con productos populares
    if (recomendados.length < 3) {
      const excludeIds = [...ids, ...recomendados.map(r => r.id)];
      const excludePlaceholders = excludeIds.length > 0 ? excludeIds.map(() => '?').join(',') : '0';
      
      const complementarios = db.prepare(`
        SELECT id, nombre, descripcion, precio, stock, categoria
        FROM productos
        WHERE stock > 0 AND activo = 1
          AND id NOT IN (${excludePlaceholders})
        ORDER BY id ASC
        LIMIT ${3 - recomendados.length}
      `).all(...(excludeIds.length > 0 ? excludeIds : []));

      recomendados = [...recomendados, ...complementarios];
    }

    return {
      ok: true,
      data: {
        recomendaciones: recomendados,
        motivo: categoriasEnCarrito.length > 0 
          ? `Basado en tus elecciones de ${categoriasEnCarrito.join(', ')}`
          : 'Recomendaciones destacadas de la tienda'
      },
      error: null
    };
  }
};
