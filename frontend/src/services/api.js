const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Función genérica de petición HTTP con manejo consistente de errores { error: "..." }
 * Captura códigos 400, 404, 409 y despliega el mensaje exacto enviado por la API.
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Errores de red / conexión rechazada
    const netError = new Error('No se pudo conectar con el servidor backend en http://localhost:3001. Verifica que el servidor de Express esté ejecutándose.');
    netError.status = 503;
    throw netError;
  }
}

// -------------------------------------------------------------
// Autenticación y Cuentas
// -------------------------------------------------------------
export async function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCustomer(customerData) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

export async function logoutUser() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export async function getSessionMe() {
  return request('/auth/me');
}

// -------------------------------------------------------------
// Productos
// -------------------------------------------------------------
export async function getProductos(params = {}) {
  const query = new URLSearchParams();
  if (params.categoria && params.categoria !== 'Todas') query.append('categoria', params.categoria);
  const search = params.search || params.busqueda;
  if (search) query.append('search', search);
  if (params.orden) query.append('orden', params.orden);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/productos${qs}`);
}

export async function getProductosAdmin() {
  return request('/productos/admin');
}

export async function getCategorias() {
  return request('/productos/categorias');
}

export async function getProductoById(id) {
  return request(`/productos/${id}`);
}

export async function createProducto(productoData) {
  return request('/productos', {
    method: 'POST',
    body: JSON.stringify(productoData),
  });
}

export async function updateProducto(id, productoData) {
  return request(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productoData),
  });
}

export async function deleteProducto(id) {
  return request(`/productos/${id}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// Clientes
// -------------------------------------------------------------
export async function getClientes() {
  return request('/clientes');
}

export async function getClienteById(id) {
  return request(`/clientes/${id}`);
}

export async function createCliente(clienteData) {
  return request('/clientes', {
    method: 'POST',
    body: JSON.stringify(clienteData),
  });
}

export async function getCostoEnvio(ciudad) {
  const qs = ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '';
  return request(`/clientes/calcular-envio${qs}`);
}

// -------------------------------------------------------------
// Cupones
// -------------------------------------------------------------
export async function getCupones() {
  return request('/cupones');
}

export async function getCuponById(id) {
  return request(`/cupones/${id}`);
}

export async function validarCupon(codigo, cliente_id, subtotal = 0) {
  return request('/cupones/validar', {
    method: 'POST',
    body: JSON.stringify({ codigo, cliente_id, subtotal }),
  });
}

// -------------------------------------------------------------
// Órdenes
// -------------------------------------------------------------
export async function getOrdenes(params = {}) {
  const query = new URLSearchParams();
  if (params.estado && params.estado !== 'Todos') query.append('estado', params.estado);
  if (params.cliente_id) query.append('cliente_id', params.cliente_id);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/ordenes${qs}`);
}

export async function getOrdenById(id) {
  return request(`/ordenes/${id}`);
}

export async function createOrden(ordenData) {
  return request('/ordenes', {
    method: 'POST',
    body: JSON.stringify(ordenData),
  });
}

export async function updateEstadoOrden(id, nuevoEstado) {
  return request(`/ordenes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: nuevoEstado }),
  });
}

export async function cancelarOrden(id) {
  return request(`/ordenes/${id}/cancelar`, {
    method: 'PATCH',
  });
}

// -------------------------------------------------------------
// Métricas y Resumen
// -------------------------------------------------------------
export async function getResumen() {
  return request('/resumen');
}

// -------------------------------------------------------------
// Asistente IA (n8n Webhook / Copilot)
// -------------------------------------------------------------
export async function generarDescripcionIA(nombre, categoria) {
  return request('/ia/generar-descripcion', {
    method: 'POST',
    body: JSON.stringify({ nombre, categoria }),
  });
}

export async function recomendarCarritoIA(productoIds = []) {
  return request('/ia/recomendar', {
    method: 'POST',
    body: JSON.stringify({ carrito_ids: productoIds }),
  });
}
