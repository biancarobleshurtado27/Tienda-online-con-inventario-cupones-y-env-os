/**
 * Script de validación automatizada de los endpoints del backend
 * Prueba códigos HTTP 200, 201, 400, 404 y 409 según los requisitos del Laboratorio 2
 * Actualizado para incluir autenticación con cookies httpOnly en endpoints protegidos
 */

const BASE_URL = 'http://localhost:3001/api';

async function testSuite() {
  console.log('🧪 Iniciando batería de pruebas del Backend...');
  let passed = 0;
  let failed = 0;

  async function assertCase(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // 0. Autenticación de sesiones de prueba
  const staffRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'personal@mundojuguete.cr', password: 'Password123!' })
  });
  const staffCookie = staffRes.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[0] || '';

  const clientRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'carlos.mora@example.com', password: 'Password123!' })
  });
  const clientCookie = clientRes.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[0] || '';

  // 1. GET /api/productos (200) - Público
  await assertCase('GET /api/productos devuelve 200 y lista de productos', async () => {
    const res = await fetch(`${BASE_URL}/productos`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Se esperaba una lista de productos');
  });

  // 2. POST /api/productos con datos inválidos (400) - Personal
  await assertCase('POST /api/productos con precio negativo rechaza con 400', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({ nombre: 'Prueba', precio: -5, stock: 10, categoria: 'Construcción' })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba { error: "mensaje" }');
  });

  // 3. POST /api/productos con datos válidos (201) - Personal
  let nuevoProductoId = null;
  await assertCase('POST /api/productos con datos válidos crea producto con 201', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({
        nombre: 'Rompecabezas 3D Madera Castillo Test',
        descripcion: 'Madera pulida de abedul con piezas cortadas a láser',
        precio: 22.50,
        stock: 5,
        categoria: 'Construcción'
      })
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido: ${res.status}`);
    const data = await res.json();
    nuevoProductoId = data.id;
    if (!data.id || data.nombre !== 'Rompecabezas 3D Madera Castillo Test') throw new Error('Datos incorrectos en la respuesta');
  });

  // 4. GET /api/productos/:id no existente (404) - Público
  await assertCase('GET /api/productos/9999 devuelve 404', async () => {
    const res = await fetch(`${BASE_URL}/productos/9999`);
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido: ${res.status}`);
  });

  // 5. GET /api/cupones (200) - Personal
  await assertCase('GET /api/cupones devuelve 200 y lista de cupones con usos actuales', async () => {
    const res = await fetch(`${BASE_URL}/cupones`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Se esperaba array de cupones');
  });

  // 6. Validar cupón vencido (409) - Público
  await assertCase('POST /api/cupones/validar con cupón vencido rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/cupones/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 'VENCIDO15', cliente_id: 1, subtotal: 100 })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 7. GET /api/resumen (200 con SQL SUM, COUNT, GROUP BY) - Personal
  await assertCase('GET /api/resumen devuelve 200 y métricas calculadas', async () => {
    const res = await fetch(`${BASE_URL}/resumen`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.ventas_por_categoria || !data.top3_productos || data.valor_promedio_orden === undefined) {
      throw new Error('Estructura de métricas incompleta');
    }
  });

  // 8. Crear orden: rechazo por stock insuficiente (409) - Cliente
  await assertCase('POST /api/ordenes con cantidad mayor al stock disponible rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [{ producto_id: nuevoProductoId, cantidad: 999 }]
      })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error.includes('Stock insuficiente')) throw new Error(`Mensaje inesperado: ${data.error}`);
  });

  // 9. Crear orden válida: descuento de stock y cálculo de envío (201) - Cliente (Carlos Mora, San José: envío gratis > $50 o $3.50)
  let ordenCreadaId = null;
  await assertCase('POST /api/ordenes con stock disponible crea orden y descuenta stock (201)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [{ producto_id: nuevoProductoId, cantidad: 2 }], // 2 * 22.50 = 45.00 (< 50, San José aplica envío $3.50)
        codigo_cupon: null
      })
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Status esperado 201, recibido ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    ordenCreadaId = data.id;
    if (data.subtotal !== 45 || data.envio !== 5 || data.total !== 50) {
      throw new Error(`Cálculo de envío o totales incorrecto: subtotal ${data.subtotal}, envio ${data.envio}, total ${data.total}`);
    }

    // Comprobar que el stock del producto disminuyó de 5 a 3
    const prodRes = await fetch(`${BASE_URL}/productos/${nuevoProductoId}`);
    const prodData = await prodRes.json();
    if (prodData.stock !== 3) throw new Error(`El stock debió bajar a 3, pero es: ${prodData.stock}`);
  });

  // 10. GET /api/ordenes/:id con datos relacionados (200) - Staff
  await assertCase('GET /api/ordenes/:id devuelve orden con cliente e items relacionados (200)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.cliente_nombre || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Faltan datos relacionados (cliente o items)');
    }
  });

  // 11. Cancelar orden válida y reponer stock en transacción (200) - Staff
  await assertCase('PATCH /api/ordenes/:id/cancelar cancela la orden y repone el stock (200)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}/cancelar`, {
      method: 'PATCH',
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Status esperado 200, recibido ${res.status}: ${err.error}`);
    }

    // Comprobar que el stock volvió a 5
    const prodRes = await fetch(`${BASE_URL}/productos/${nuevoProductoId}`);
    const prodData = await prodRes.json();
    if (prodData.stock !== 5) throw new Error(`El stock debió reponerse a 5, pero es: ${prodData.stock}`);
  });

  // 12. Cancelar orden ya cancelada (409) - Staff
  await assertCase('PATCH /api/ordenes/:id/cancelar de una orden ya cancelada rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}/cancelar`, {
      method: 'PATCH',
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 13. Cancelar orden en estado 'enviada' o 'entregada' (409) - Staff
  await assertCase('PATCH /api/ordenes/2/cancelar (orden entregada) rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/2/cancelar`, {
      method: 'PATCH',
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 14. Transición inválida de estado (409) - Staff
  await assertCase('PATCH /api/ordenes/:id/estado salto inválido de estado rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/4/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({ estado: 'entregada' }) // Orden 4 está en 'nueva', no puede saltar a 'entregada'
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 15. Endpoint de IA: generar descripción (200 con contrato { ok, data, error })
  await assertCase('POST /api/ia/generar-descripcion responde contrato { ok, data, error }', async () => {
    const res = await fetch(`${BASE_URL}/ia/generar-descripcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Set Bloques Castillo Medieval', categoria: 'Construcción' })
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (typeof data.ok !== 'boolean' || data.error === undefined) throw new Error('Contrato inválido en respuesta de IA');
  });

  await assertCase('POST /api/ia/recomendar responde contrato { ok, data, error }', async () => {
    const res = await fetch(`${BASE_URL}/ia/recomendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrito_ids: [1, 2] })
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (typeof data.ok !== 'boolean' || data.error === undefined) throw new Error('Contrato inválido en respuesta de IA');
  });

  // =========================================================================
  // PRUEBAS DE CASOS LÍMITE (ROBUSTEZ, TIPOS, TRIM, CONSOLIDACIÓN, ATOMICIDAD)
  // =========================================================================

  // 16. Validación de IDs no válidos (400 en lugar de 500)
  await assertCase('GET /api/ordenes/texto_invalido devuelve 400 y formato { error }', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/texto_invalido`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  await assertCase('GET /api/productos/nan devuelve 400', async () => {
    const res = await fetch(`${BASE_URL}/productos/nan`);
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  // 17. Validación de tipos numéricos finitos en productos (400 en lugar de 500)
  await assertCase('POST /api/productos con precio no numérico "cien" devuelve 400', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({ nombre: 'Juguete Test', precio: 'cien', stock: 5, categoria: 'Juegos de mesa' })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  await assertCase('POST /api/productos con stock decimal (no entero) devuelve 400', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({ nombre: 'Juguete Test', precio: 25.50, stock: 4.8, categoria: 'Peluches' })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  // 18. Protección de llamadas .trim() sobre valores que no son cadenas (400 sin 500)
  await assertCase('POST /api/productos con nombre numérico no lanza error 500 y devuelve 400', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
      body: JSON.stringify({ nombre: 12345, precio: 20.00, stock: 10, categoria: 'Vehículos y Exterior' })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  await assertCase('POST /api/cupones/validar con código tipo número no lanza error 500 y devuelve 400', async () => {
    const res = await fetch(`${BASE_URL}/cupones/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 99999, cliente_id: 1, subtotal: 50 })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba objeto con propiedad error');
  });

  await assertCase('GET /api/clientes/calcular-envio con ciudad no mapeada responde 200 con tarifa default', async () => {
    const res = await fetch(`${BASE_URL}/clientes/calcular-envio?ciudad=Desconocida`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (typeof data.costo_envio !== 'number' || data.costo_envio !== 10.00) throw new Error('Costo de envío inválido');
  });

  // 19. Bloqueo de bypass de estado inicial en ordenes
  await assertCase('POST /api/ordenes con estado_inicial "entregada" es rechazado con 400', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [{ producto_id: 1, cantidad: 1 }],
        estado_inicial: 'entregada'
      })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error.includes("nueva")) throw new Error(`Mensaje inesperado: ${data.error}`);
  });

  // 20. Consolidación de ítems repetidos que en conjunto superan el inventario (409)
  const prodTestRes = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: staffCookie },
    body: JSON.stringify({
      nombre: 'Auto Radiocontrol Veloz Test',
      precio: 80.00,
      stock: 4,
      categoria: 'Vehículos y Exterior'
    })
  });
  const prodTest = await prodTestRes.json();
  const prodTestId = prodTest.id;

  await assertCase('POST /api/ordenes consolida ítems repetidos y rechaza con 409 si la suma (3+3=6) supera el stock (4)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [
          { producto_id: prodTestId, cantidad: 3 },
          { producto_id: prodTestId, cantidad: 3 }
        ]
      })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error.includes('Stock insuficiente')) throw new Error(`Mensaje de error inesperado: ${data.error}`);

    // Verificar que el stock no fue descontado parcialmente
    const checkProd = await fetch(`${BASE_URL}/productos/${prodTestId}`);
    const checkData = await checkProd.json();
    if (checkData.stock !== 4) throw new Error(`El stock debió mantenerse intacto en 4, pero es: ${checkData.stock}`);
  });

  // 21. Consolidación de ítems repetidos dentro del stock disponible (201)
  await assertCase('POST /api/ordenes consolida ítems repetidos válidos (2+1=3 <= 4) y crea orden con 201', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [
          { producto_id: prodTestId, cantidad: 2 },
          { producto_id: prodTestId, cantidad: 1 }
        ]
      })
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Status esperado 201, recibido ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (data.estado !== 'nueva') throw new Error(`El estado inicial debe ser 'nueva', recibido: ${data.estado}`);
    
    // El subtotal debe ser 3 * 80.00 = 240.00
    if (data.subtotal !== 240.00) throw new Error(`Subtotal consolidado erróneo: ${data.subtotal}`);

    // Debe contener 1 ítem consolidado en items con cantidad 3
    if (!Array.isArray(data.items) || data.items.length !== 1 || data.items[0].cantidad !== 3) {
      throw new Error(`Se esperaba 1 ítem consolidado con cantidad 3, recibido: ${JSON.stringify(data.items)}`);
    }

    // El stock del producto debe haber bajado de 4 a 1
    const checkProd = await fetch(`${BASE_URL}/productos/${prodTestId}`);
    const checkData = await checkProd.json();
    if (checkData.stock !== 1) throw new Error(`El stock debió bajar a 1, pero es: ${checkData.stock}`);
  });

  // 22. Atomicidad transaccional: fallo posterior no descuenta stock previo
  await assertCase('POST /api/ordenes no descuenta stock parcialmente si falla por cupón inválido', async () => {
    const stockAntes = (await (await fetch(`${BASE_URL}/productos/${prodTestId}`)).json()).stock;
    
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: clientCookie },
      body: JSON.stringify({
        items: [{ producto_id: prodTestId, cantidad: 1 }],
        codigo_cupon: 'CUPON_INEXISTENTE_XYZ'
      })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);

    const stockDespues = (await (await fetch(`${BASE_URL}/productos/${prodTestId}`)).json()).stock;
    if (stockDespues !== stockAntes) {
      throw new Error(`Rollback falló: stock antes (${stockAntes}) difiere de stock después (${stockDespues})`);
    }
  });

  // 23. GET /api/ordenes/:id retorna estructuras completas de cliente, cupón e ítems
  await assertCase('GET /api/ordenes/:id retorna cliente, cupon e items relacionados como objetos', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/1`, {
      headers: { Cookie: staffCookie }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();

    if (!data.cliente || typeof data.cliente !== 'object' || !data.cliente.nombre || !data.cliente.ciudad) {
      throw new Error('Estructura de cliente ausente o inválida en orden');
    }

    if (data.cupon_id && (!data.cupon || typeof data.cupon !== 'object' || !data.cupon.codigo)) {
      throw new Error('Estructura de cupón ausente o inválida en orden');
    }

    if (!Array.isArray(data.items) || data.items.length === 0 || !data.items[0].producto_nombre) {
      throw new Error('Estructura de items ausente o inválida en orden');
    }
  });

  console.log(`\n========================================`);
  console.log(`🎯 Resumen de pruebas: ${passed} pasadas, ${failed} falladas`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

testSuite().catch(err => {
  console.error('Error fatal en suite de pruebas:', err);
  process.exit(1);
});
