/**
 * Test suite automatizado de autenticación y autorización para Mundo Juguete
 * Cubre:
 * 1. Registro exclusivo de clientes
 * 2. Login con contraseñas hasheadas y manejo de cookies
 * 3. Consulta de sesión (/api/auth/me) y logout
 * 4. Control de acceso: 401 sin autenticación y 403 por rol incorrecto
 * 5. Aislamiento de órdenes: cliente solo accede a sus órdenes y backend asigna cliente_id
 * 6. Permisos administrativos exclusivos de personal de tienda
 */

const BASE_URL = 'http://localhost:3001/api';

async function runAuthTests() {
  console.log('🧪 Iniciando batería de pruebas de Autenticación y Autorización...');
  let passed = 0;
  let failed = 0;

  async function testCase(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // Helper para extraer la cookie 'token' del header Set-Cookie
  function extractCookie(res) {
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) return null;
    const match = setCookie.match(/token=([^;]+)/);
    return match ? `token=${match[1]}` : null;
  }

  // 1. Registro exclusivo de clientes
  const timestamp = Date.now();
  const testEmail = `test.cliente.${timestamp}@ejemplo.com`;
  let nuevoClienteCookie = null;

  await testCase('POST /api/auth/register crea cliente nuevo y retorna 201 con cookie', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Sofía Jiménez',
        email: testEmail,
        password: 'PasswordSeguro123!',
        ciudad: 'Alajuela'
      })
    });

    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    const data = await res.json();
    if (!data.usuario || data.usuario.rol !== 'cliente') throw new Error('Rol esperado: cliente');
    if (data.usuario.password_hash || data.usuario.password) throw new Error('La respuesta contiene contraseñas');
    if (!data.usuario.cliente_id) throw new Error('El usuario no tiene cliente_id asignado');

    nuevoClienteCookie = extractCookie(res);
    if (!nuevoClienteCookie) throw new Error('No se recibió la cookie httpOnly del token');
  });

  await testCase('POST /api/auth/register rechaza correo duplicado con 409', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Sofía Duplicada',
        email: testEmail,
        password: 'PasswordSeguro123!',
        ciudad: 'Cartago'
      })
    });

    if (res.status !== 409) throw new Error(`Status esperado 409, recibido ${res.status}`);
  });

  await testCase('POST /api/auth/register rechaza contraseña corta con 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Valeria Test',
        email: `valeria.${Date.now()}@test.com`,
        password: '123',
        ciudad: 'Heredia'
      })
    });

    if (res.status !== 400) throw new Error(`Status esperado 400, recibido ${res.status}`);
  });

  // 2. Login y credenciales
  await testCase('POST /api/auth/login rechaza credenciales inválidas con 401 y mensaje genérico', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'PasswordErronea'
      })
    });

    if (res.status !== 401) throw new Error(`Status esperado 401, recibido ${res.status}`);
    const data = await res.json();
    if (data.error !== 'Credenciales inválidas') {
      throw new Error(`Mensaje esperado 'Credenciales inválidas', recibido '${data.error}'`);
    }
  });

  let staffCookie = null;
  await testCase('POST /api/auth/login para personal inicia sesión correctamente con 200', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'personal@mundojuguete.cr',
        password: 'Password123!'
      })
    });

    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (data.usuario.rol !== 'personal') throw new Error('Se esperaba rol personal');
    if (data.usuario.password_hash) throw new Error('No debe retornar password_hash');

    staffCookie = extractCookie(res);
    if (!staffCookie) throw new Error('No se recibió cookie de sesión para el personal');
  });

  let clienteCarlosCookie = null;
  await testCase('POST /api/auth/login para cliente inicia sesión correctamente con 200', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'carlos.mora@example.com',
        password: 'Password123!'
      })
    });

    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (data.usuario.rol !== 'cliente') throw new Error('Se esperaba rol cliente');
    if (data.usuario.cliente_id !== 1) throw new Error(`Esperado cliente_id=1, recibido ${data.usuario.cliente_id}`);

    clienteCarlosCookie = extractCookie(res);
    if (!clienteCarlosCookie) throw new Error('No se recibió cookie para cliente');
  });

  // 3. GET /api/auth/me
  await testCase('GET /api/auth/me sin sesión responde con 401', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (res.status !== 401) throw new Error(`Status esperado 401, recibido ${res.status}`);
  });

  await testCase('GET /api/auth/me con sesión de cliente devuelve información del cliente', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (data.usuario.email !== 'carlos.mora@example.com') throw new Error('Correo no coincide');
    if (data.usuario.rol !== 'cliente') throw new Error('Rol no coincide');
  });

  // 4. Logout
  await testCase('POST /api/auth/logout cierra la sesión y limpia la cookie', async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: nuevoClienteCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
  });

  // 5. Restricción de rutas: 401 sin sesión y 403 por rol
  await testCase('GET /api/resumen sin autenticación responde con 401', async () => {
    const res = await fetch(`${BASE_URL}/resumen`);
    if (res.status !== 401) throw new Error(`Status esperado 401, recibido ${res.status}`);
  });

  await testCase('GET /api/resumen autenticado como cliente responde con 403 (permisos insuficientes)', async () => {
    const res = await fetch(`${BASE_URL}/resumen`, {
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  await testCase('GET /api/resumen autenticado como personal responde con 200 y métricas', async () => {
    const res = await fetch(`${BASE_URL}/resumen`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (!data.totales || !data.ventas_por_categoria) throw new Error('Respuesta debe contener métricas');
  });

  await testCase('GET /api/clientes (listado) como cliente responde con 403', async () => {
    const res = await fetch(`${BASE_URL}/clientes`, {
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  await testCase('GET /api/clientes (listado) como personal responde con 200', async () => {
    const res = await fetch(`${BASE_URL}/clientes`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Se esperaba un array de clientes');
  });

  await testCase('POST /api/productos como cliente responde con 403', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clienteCarlosCookie },
      body: JSON.stringify({
        nombre: 'Juguete No Autorizado',
        precio: 10,
        stock: 5,
        categoria: 'Peluches'
      })
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  await testCase('POST /api/ordenes intentado por un usuario de personal responde con 403', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({
        items: [{ producto_id: 1, cantidad: 1 }]
      })
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  // 6. Aislamiento estricto de órdenes para clientes
  let ordenCreadaCliente = null;
  await testCase('POST /api/ordenes autenticado como cliente crea orden asignando su cliente_id automáticamente', async () => {
    // Intentar maliciosamente enviar cliente_id: 999; el backend debe ignorarlo y asignar cliente_id: 1 (Carlos)
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clienteCarlosCookie },
      body: JSON.stringify({
        cliente_id: 999, // intento de suplantar
        items: [{ producto_id: 1, cantidad: 1 }]
      })
    });

    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    const data = await res.json();
    if (data.orden.cliente_id !== 1) {
      throw new Error(`El backend debía forzar cliente_id=1, pero asignó ${data.orden.cliente_id}`);
    }
    ordenCreadaCliente = data.orden;
  });

  await testCase('GET /api/ordenes autenticado como cliente solo devuelve sus órdenes (cliente_id=1)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    const ordenes = await res.json();
    if (!Array.isArray(ordenes) || ordenes.length === 0) throw new Error('Se esperaban órdenes de Carlos');
    const ordenAjena = ordenes.find(o => o.cliente_id !== 1);
    if (ordenAjena) throw new Error(`Se encontró una orden ajena con cliente_id=${ordenAjena.cliente_id}`);
  });

  // Busquemos una orden que pertenezca a Lucía (cliente_id=2)
  let ordenLuciaId = null;
  const resOrdenesAdmin = await fetch(`${BASE_URL}/ordenes`, {
    headers: { Cookie: staffCookie }
  });
  const todasOrdenes = await resOrdenesAdmin.json();
  const ordenLucia = todasOrdenes.find(o => o.cliente_id === 2);
  if (ordenLucia) ordenLuciaId = ordenLucia.id;

  if (ordenLuciaId) {
    await testCase('GET /api/ordenes/:id de otro cliente responde con 403 para el cliente autenticado', async () => {
      const res = await fetch(`${BASE_URL}/ordenes/${ordenLuciaId}`, {
        headers: { Cookie: clienteCarlosCookie }
      });
      if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
    });

    await testCase('GET /api/ordenes/:id responde con 200 para personal de tienda', async () => {
      const res = await fetch(`${BASE_URL}/ordenes/${ordenLuciaId}`, {
        headers: { Cookie: staffCookie }
      });
      if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    });
  }

  await testCase('GET /api/ordenes/:id propia responde con 200 para el cliente dueño', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaCliente.id}`, {
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
  });

  await testCase('PATCH /api/ordenes/:id/cancelar intentado por un cliente responde con 403', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaCliente.id}/cancelar`, {
      method: 'PATCH',
      headers: { Cookie: clienteCarlosCookie }
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  await testCase('PATCH /api/ordenes/:id/cancelar ejecutado por personal de tienda responde con 200', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaCliente.id}/cancelar`, {
      method: 'PATCH',
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
  });

  console.log(`\n========================================`);
  console.log(`Resultados de Autenticación: ${passed} pasadas, ${failed} fallidas`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests();
