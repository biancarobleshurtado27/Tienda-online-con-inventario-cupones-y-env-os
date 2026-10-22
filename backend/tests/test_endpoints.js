/**
 * Script de validación automatizada de los endpoints del backend
 * Prueba códigos HTTP 200, 201, 400, 404 y 409 según los requisitos del Laboratorio 2
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

  // 1. GET /api/productos (200)
  await assertCase('GET /api/productos devuelve 200 y lista de productos', async () => {
    const res = await fetch(`${BASE_URL}/productos`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Se esperaba una lista de productos');
  });

  // 2. POST /api/productos con datos inválidos (400)
  await assertCase('POST /api/productos con precio negativo rechaza con 400', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Prueba', precio: -5, stock: 10, categoria: 'Periféricos' })
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Se esperaba { error: "mensaje" }');
  });

  // 3. POST /api/productos con datos válidos (201)
  let nuevoProductoId = null;
  await assertCase('POST /api/productos con datos válidos crea producto con 201', async () => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Mouse Pad XL Gamer Test',
        descripcion: 'Superficie de tela de baja fricción',
        precio: 22.50,
        stock: 5,
        categoria: 'Accesorios'
      })
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido: ${res.status}`);
    const data = await res.json();
    nuevoProductoId = data.id;
    if (!data.id || data.nombre !== 'Mouse Pad XL Gamer Test') throw new Error('Datos incorrectos en la respuesta');
  });

  // 4. GET /api/productos/:id no existente (404)
  await assertCase('GET /api/productos/9999 devuelve 404', async () => {
    const res = await fetch(`${BASE_URL}/productos/9999`);
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido: ${res.status}`);
  });

  // 5. GET /api/cupones (200)
  await assertCase('GET /api/cupones devuelve 200 y lista de cupones con usos actuales', async () => {
    const res = await fetch(`${BASE_URL}/cupones`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Se esperaba array de cupones');
  });

  // 6. Validar cupón vencido (409)
  await assertCase('POST /api/cupones/validar con cupón vencido rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/cupones/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 'VENCIDO15', cliente_id: 1, subtotal: 100 })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 7. GET /api/resumen (200 con SQL SUM, COUNT, GROUP BY)
  await assertCase('GET /api/resumen devuelve 200 y métricas calculadas', async () => {
    const res = await fetch(`${BASE_URL}/resumen`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.ventas_por_categoria || !data.top3_productos || data.valor_promedio_orden === undefined) {
      throw new Error('Estructura de métricas incompleta');
    }
  });

  // 8. Crear orden: rechazo por stock insuficiente (409)
  await assertCase('POST /api/ordenes con cantidad mayor al stock disponible rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: 1,
        items: [{ producto_id: nuevoProductoId, cantidad: 999 }]
      })
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.error.includes('Stock insuficiente')) throw new Error(`Mensaje inesperado: ${data.error}`);
  });

  // 9. Crear orden válida: descuento de stock y cálculo de envío (201)
  let ordenCreadaId = null;
  await assertCase('POST /api/ordenes con stock disponible crea orden y descuenta stock (201)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: 5, // David Valverde (Puntarenas)
        items: [{ producto_id: nuevoProductoId, cantidad: 2 }], // 2 * 22.50 = 45.00 (< 50, aplica envío de Puntarenas $10)
        codigo_cupon: null
      })
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Status esperado 201, recibido ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    ordenCreadaId = data.id;
    if (data.subtotal !== 45 || data.envio !== 10 || data.total !== 55) {
      throw new Error(`Cálculo de envío o totales incorrecto: subtotal ${data.subtotal}, envio ${data.envio}, total ${data.total}`);
    }

    // Comprobar que el stock del producto disminuyó de 5 a 3
    const prodRes = await fetch(`${BASE_URL}/productos/${nuevoProductoId}`);
    const prodData = await prodRes.json();
    if (prodData.stock !== 3) throw new Error(`El stock debió bajar a 3, pero es: ${prodData.stock}`);
  });

  // 10. GET /api/ordenes/:id con datos relacionados (200)
  await assertCase('GET /api/ordenes/:id devuelve orden con cliente e items relacionados (200)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}`);
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.cliente_nombre || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Faltan datos relacionados (cliente o items)');
    }
  });

  // 11. Cancelar orden válida y reponer stock en transacción (200)
  await assertCase('PATCH /api/ordenes/:id/cancelar cancela la orden y repone el stock (200)', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}/cancelar`, {
      method: 'PATCH'
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

  // 12. Cancelar orden ya cancelada (409)
  await assertCase('PATCH /api/ordenes/:id/cancelar de una orden ya cancelada rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/${ordenCreadaId}/cancelar`, {
      method: 'PATCH'
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 13. Cancelar orden en estado 'enviada' o 'entregada' (409)
  await assertCase('PATCH /api/ordenes/2/cancelar (orden entregada) rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/2/cancelar`, {
      method: 'PATCH'
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 14. Transición inválida de estado (409)
  await assertCase('PATCH /api/ordenes/:id/estado salto inválido de estado rechaza con 409', async () => {
    const res = await fetch(`${BASE_URL}/ordenes/4/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'entregada' }) // Orden 4 está en 'nueva', no puede saltar a 'entregada'
    });
    if (res.status !== 409) throw new Error(`Status esperado 409, recibido: ${res.status}`);
  });

  // 15. Endpoint de IA: generar descripción (200 con contrato { ok, data, error })
  await assertCase('POST /api/ia/generar-descripcion responde contrato { ok, data, error }', async () => {
    const res = await fetch(`${BASE_URL}/ia/generar-descripcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Teclado Mecánico', categoria: 'Periféricos' })
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido: ${res.status}`);
    const data = await res.json();
    if (!data.ok || !data.data || !data.data.descripcion_generada) throw new Error('Contrato inválido en respuesta de IA');
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
