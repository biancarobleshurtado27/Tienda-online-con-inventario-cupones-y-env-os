import db from '../db.js';
import { isNonEmptyString, isValidId } from '../utils/validators.js';

export const iaService = {
  /**
   * Genera una descripción comercial conectando exclusivamente con el webhook de n8n.
   * Si n8n no está configurado o no responde, devuelve un error claro y honesto.
   * Contrato garantizado: { "ok": boolean, "data": object|null, "error": string|null }
   */
  async generarDescripcion(nombre, categoria) {
    if (!isNonEmptyString(nombre) || !isNonEmptyString(categoria)) {
      const err = new Error('Nombre y categoría son requeridos y deben ser cadenas de texto no vacías');
      err.statusCode = 400;
      throw err;
    }

    const cleanNombre = nombre.trim();
    const cleanCategoria = categoria.trim();
    const n8nUrl = process.env.N8N_WEBHOOK_URL;

    // Validación estricta y honesta: sin agente funcional local encubierto
    if (!n8nUrl || n8nUrl.trim() === '') {
      return {
        ok: false,
        data: null,
        error: 'El servicio de IA no está configurado. La variable N8N_WEBHOOK_URL no está definida en backend/.env. Por favor, configura la URL del webhook de n8n.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generar_descripcion',
          nombre: cleanNombre,
          categoria: cleanCategoria
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (!response.ok || !json) {
        return {
          ok: false,
          data: null,
          error: json?.error || `El webhook de n8n respondió con error HTTP ${response.status} (${response.statusText}).`
        };
      }

      // Si el webhook devolvió el contrato formal
      if (typeof json.ok === 'boolean') {
        return json;
      }

      return {
        ok: true,
        data: json,
        error: null
      };
    } catch (err) {
      return {
        ok: false,
        data: null,
        error: `No se pudo conectar con el webhook de n8n en ${n8nUrl} (${err.message}). Verifica que el servidor de n8n esté activo y el workflow esté encendido.`
      };
    }
  },

  /**
   * Recomienda productos consultando exclusivamente al webhook de n8n.
   * Enriquece la llamada con los ítems reales del carrito y catálogo disponible.
   * Contrato garantizado: { "ok": boolean, "data": object|null, "error": string|null }
   */
  async recomendarProductos(carritoProductoIds = []) {
    const ids = Array.isArray(carritoProductoIds) 
      ? carritoProductoIds.filter(isValidId).map(Number)
      : [];

    const n8nUrl = process.env.N8N_WEBHOOK_URL;

    // Validación estricta y honesta: sin agente funcional local encubierto
    if (!n8nUrl || n8nUrl.trim() === '') {
      return {
        ok: false,
        data: null,
        error: 'El servicio de recomendaciones de IA no está configurado. Define N8N_WEBHOOK_URL en backend/.env apuntando al webhook activo de n8n.'
      };
    }

    // Obtener información real de los productos actualmente en el carrito
    let productosCarrito = [];
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      productosCarrito = db.prepare(`SELECT id, nombre, categoria, precio FROM productos WHERE id IN (${placeholders})`).all(...ids);
    }

    // Obtener catálogo disponible en stock para que el modelo de IA pueda recomendar
    const catalogoDisponible = db.prepare(`
      SELECT id, nombre, categoria, precio, stock 
      FROM productos 
      WHERE stock > 0 AND activo = 1
      ORDER BY stock DESC 
      LIMIT 10
    `).all();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recomendar',
          carrito_ids: ids,
          producto_ids: ids,
          productos_carrito: productosCarrito,
          catalogo_disponible: catalogoDisponible
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (!response.ok || !json) {
        return {
          ok: false,
          data: null,
          error: json?.error || `El webhook de n8n respondió con error HTTP ${response.status} (${response.statusText}).`
        };
      }

      // Si el webhook devolvió el contrato formal
      if (typeof json.ok === 'boolean') {
        return json;
      }

      return {
        ok: true,
        data: json,
        error: null
      };
    } catch (err) {
      return {
        ok: false,
        data: null,
        error: `No se pudo conectar con el webhook de n8n en ${n8nUrl} (${err.message}). Verifica que n8n esté ejecutándose y el webhook activo.`
      };
    }
  }
};
