# Bitácora de Interacción con Asistente de IA (Copiloto)
**Laboratorio #2 - React + Node.js + Base de Datos + IA**  
**Caso 5: Juguetería online Mundo Juguete con inventario, cupones y envíos**  
**Estudiante:** Daniel Ortiz Rivera  

---

## Prompt 1: Diseño del Modelo Relacional y Restricciones de Integridad

- **Objetivo:** Diseñar el esquema SQL de base de datos relacional para el Caso 5 garantizando normalización, restricciones de integridad y compatibilidad con SQLite/PostgreSQL.
- **Prompt enviado a la IA:**
  > "Diseña el archivo `schema.sql` para el Caso 5 (Tienda online con inventario, cupones y envíos) con las tablas `productos`, `clientes`, `cupones`, `ordenes` y `orden_items`. Incluye llaves foráneas con `ON DELETE CASCADE`, restricciones `CHECK` para precios, stock y porcentajes de descuento, y agrega datos iniciales de prueba (seed data) con al menos 5 clientes, 8 productos en distintas categorías y cupones vigentes y vencidos."
- **Qué devolvió la IA:**
  La IA generó el script DDL con las tablas principales y datos de ejemplo, pero inicialmente propuso una columna booleana pura para el estado de la orden y no incluyó explícitamente el cálculo de auditoría o estados completos (`nueva`, `pagada`, `enviada`, `entregada`, `cancelada`).
- **Qué se corrigió o ajustó:**
  1. Se ajustó el campo `estado` de la tabla `ordenes` a un `TEXT CHECK(estado IN ('nueva', 'pagada', 'enviada', 'entregada', 'cancelada'))` para soportar estrictamente el flujo de estados exigido.
  2. Se configuró `PRAGMA foreign_keys = ON;` al inicio para garantizar que SQLite aplique llaves foráneas en cascada.
  3. Se incluyó un cupón vencido (`VENCIDO15`) deliberadamente para probar el código HTTP 409 en las pruebas automatizadas.

---

## Prompt 2: Capa de Servicios con Transacciones ACID y Control de Stock

- **Objetivo:** Implementar la lógica de negocio para la creación y cancelación de órdenes utilizando transacciones atómicas.
- **Prompt enviado a la IA:**
  > "Genera el servicio `ordenes.service.js` para Express usando `better-sqlite3`. Debe validar que ningún producto solicitado supere el stock disponible (devolviendo un error con statusCode 409 si ocurre). Si todo es válido, debe crear la orden, insertar los items con su precio histórico y descontar el stock de cada producto dentro de una única transacción atómica `db.transaction`. Además, al cancelar una orden previa al envío, debe reponer el stock automáticamente."
- **Qué devolvió la IA:**
  La IA implementó la transacción usando `db.transaction(() => { ... })()`, validando el stock antes del `INSERT`. Sin embargo, en el cálculo del envío, aplicaba un valor plano sin considerar la ciudad del cliente ni el umbral de envío gratuito.
- **Qué se corrigió o ajustó:**
  1. Se implementó la matriz tarifaria de envíos por provincia/ciudad (San José: $3.50, Heredia: $4.00, Alajuela: $4.50, Cartago: $5.00, Puntarenas/otras: $7.00).
  2. Se añadió la regla de negocio: si el `subtotal - descuento >= $100.00`, el envío es $0.00 (Envío gratuito).
  3. Se añadió la validación de cancelación: solo se permite cancelar órdenes en estado `nueva` o `pagada`. Si está en `enviada` o `entregada`, se arroja error 409 con el mensaje correspondiente.

---

## Prompt 3: Validación Estricta de Cupones y Códigos de Estado HTTP

- **Objetivo:** Crear el servicio de validación de cupones con las tres reglas de negocio estipuladas.
- **Prompt enviado a la IA:**
  > "Implementa la validación de cupones en `cupones.service.js`. Un cupón solo es válido si: 1) existe en el catálogo, 2) la fecha actual no supera `vigente_hasta`, 3) los usos registrados no han superado `usos_maximos`, y 4) el cliente en sesión no lo ha usado previamente en una orden activa. Si falla alguna regla de negocio, debe rechazar con HTTP 409 y mensaje en formato `{ error: '...' }`."
- **Qué devolvió la IA:**
  La IA escribió consultas independientes y devolvía un código genérico 400 en lugar de 409 para cupones vencidos o ya utilizados por el cliente.
- **Qué se corrigió o ajustó:**
  1. Se estandarizó el uso de `err.statusCode = 409` (Conflicto de regla de negocio) en lugar de 400 (Bad Request de sintaxis) para cumplir la rúbrica del laboratorio.
  2. Se vinculó la consulta a la tabla `ordenes` filtrando por `cliente_id` y `cupon_id` para verificar si el usuario ya redimió dicho cupón en una orden no cancelada.

---

## Prompt 4: Endpoint de Métricas con Funciones de Agregación SQL

- **Objetivo:** Construir el endpoint `GET /api/resumen` para alimentar el panel del frontend.
- **Prompt enviado a la IA:**
  > "Escribe la consulta SQL para `GET /api/resumen` calculando: 1) Ventas totales por categoría con `SUM` y `GROUP BY`, 2) Los 3 productos más vendidos ordenados por unidades vendidas con `LIMIT 3`, y 3) Total recaudado, valor promedio por orden y total de órdenes. Excluye órdenes con estado 'cancelada'."
- **Qué devolvió la IA:**
  La IA entregó queries individuales bien estructuradas, pero no consideró el caso en que una orden no tuviera ítems o devolviera valores nulos en el promedio.
- **Qué se corrigió o ajustó:**
  1. Se utilizó `COALESCE(AVG(total), 0)` y `ROUND(..., 2)` para asegurar que el backend siempre entregue números decimales legibles y nunca devuelva `null` o errores de división por cero.
  2. Se agregó un bloque adicional de "Alertas de reposición" (Reto opcional del caso 5) que detecta productos con stock menor o igual a 5 unidades.

---

## Prompt 5: Arquitectura del Frontend en React con Vite, React Router y Custom Hook

- **Objetivo:** Diseñar la arquitectura del frontend con React Router, componentes reutilizables y el custom hook `useFetch`.
- **Prompt enviado a la IA:**
  > "Diseña la estructura de carpetas para el frontend en React con Vite. Implementa `src/services/api.js` como la única capa de comunicación con la API, un custom hook `useFetch(url)` con estados `{ data, loading, error, refetch }`, y un Layout con navegación para 4 vistas: Dashboard de Métricas, Catálogo de Productos, Nueva Orden y Gestión de Órdenes."
- **Qué devolvió la IA:**
  La IA propuso un hook básico con `useEffect`, pero no contemplaba la función `refetch` para forzar la recarga de datos tras crear o cancelar una orden, ni manejaba la captura unificada del `{ error: res.json().error }`.
- **Qué se corrigió o ajustó:**
  1. Se añadió `useCallback` y un flag de recarga en `useFetch` para permitir a las vistas refrescar datos sin recargar la página.
  2. En `src/services/api.js`, se implementaron funciones centralizadas (`getProductos`, `createProducto`, `getOrdenes`, `createOrden`, `cancelarOrden`, `validarCupon`, `getResumen`, `consultarIA`) con captura de excepciones HTTP 400 y 409 para mostrarlas en el front de manera amigable.

---

## Prompt 6: Integración del Agente de IA con n8n y Contrato Formal `{ ok, data, error }`

- **Objetivo:** Implementar la integración de Inteligencia Artificial mediante un webhook real en n8n que responda siempre bajo el contrato formal `{ ok: true|false, data: ..., error: null|"mensaje" }`, sin simulaciones locales engañosas.
- **Prompt enviado a la IA:**
  > "Implementa la funcionalidad obligatoria de IA mediante n8n. Crea un workflow JSON sin credenciales para un webhook que reciba una acción y responda siempre con `{ ok, data, error }`. Debe soportar generar_descripcion y recomendar. Configura el backend con N8N_WEBHOOK_URL. Si n8n no está configurado, devuelve un error claro y honesto."
- **Qué devolvió la IA:**
  La IA implementó el webhook en n8n y los servicios del backend, pero inicialmente utilizaba nodos con credenciales OpenAI obligatorias que fallaban al importar si el evaluador no tenía API key configurada.
- **Qué se corrigió o ajustó:**
  1. Se rediseñó el workflow de n8n usando nodos nativos `Webhook`, `Switch`, `Code` y `Respond to Webhook` sin dependencias de credenciales para que funcione de inmediato en cualquier instalación de n8n.
  2. En el backend se eliminaron los generadores locales encubiertos para devolver un mensaje 100% honesto si n8n está desconectado.
  3. Se conectó la generación de copia persuasiva en el modal de producto y las recomendaciones justificadas en el carrito de compras.

---

## Prompt 7: Transformación del Dominio a Juguetería "Mundo Juguete"

- **Objetivo:** Adaptar el dominio completo del proyecto de una tienda de tecnología a la juguetería "Mundo Juguete", conservando intacta la arquitectura técnica, las transacciones ACID, las reglas de negocio y los contratos de API.
- **Prompt enviado a la IA:**
  > "Transforma el proyecto de una tienda de tecnología llamada TechStore a una juguetería llamada 'Mundo Juguete'. Usa categorías como: Construcción, Muñecas y figuras, Juegos de mesa, Peluches, Arte y manualidades, Vehículos y Exterior. Conserva precios, stock, cupones, clientes y órdenes de muestra, pero adapta descripciones, textos de frontend y backend, workflow de n8n y pruebas automatizadas."
- **Qué devolvió la IA:**
  La IA actualizó el esquema y los textos visibles en el navbar y catálogo, pero debió revisarse que los IDs de cupones y los montos históricos de las órdenes mantuvieran coherencia exacta con los subtotales y tarifas de envío ya registradas.
- **Qué se corrigió o ajustó:**
  1. Se mapearon los 10 productos semilla con precios idénticos ($65, $35, $180, $85, etc.) para que las órdenes 1 a 5 y los tests de cálculo de envío conservaran su validez matemática exacta.
  2. Se actualizaron los templates del webhook de n8n para generar copias didácticas y recomendaciones según edades y categorías infantiles.
  3. Se adaptaron las pruebas automatizadas en `backend/tests/test_endpoints.js` para usar los nuevos juguetes en todas las aserciones HTTP 200, 201, 400, 404 y 409.

---

## Prompt 8: Implementación de Autenticación Real con Dos Tipos de Cuenta (Cliente y Personal)

- **Objetivo:** Implementar un sistema de autenticación y autorización real con tokens JWT en cookies `httpOnly`, contraseñas con bcrypt, roles diferenciados (`cliente` y `personal`), protección estricta en el backend y separación de vistas en React.
- **Prompt enviado a la IA:**
  > "Implementa autenticación real con dos tipos de cuenta para 'Mundo Juguete': Cliente (catálogo, carrito, crear y consultar únicamente sus propias órdenes) y Personal de tienda (acceso al panel administrativo, inventario, métricas y gestión de todas las órdenes). No simules autenticación en React: la autorización debe validarse obligatoriamente en el backend. Crea la tabla usuarios en SQLite con contraseñas hasheadas con bcryptjs, JWT en cookie httpOnly sameSite: 'lax', endpoints de auth (/register, /login, /logout, /me), middlewares requireAuth y requireRole, aislamiento de órdenes para clientes, y en el frontend AuthContext, páginas /iniciar-sesion, /registro y /mi-cuenta con diseño Nube de algodón."
- **Qué devolvió la IA:**
  La IA diseñó la tabla `usuarios` y los endpoints de Express, pero inicialmente vinculaba las órdenes a través del usuario y no a través del `cliente_id` existente, lo cual podía romper las órdenes históricas. También en el frontend, el carrito requería seleccionar el cliente en lugar de inferirlo de la sesión autenticada.
- **Qué se corrigió o ajustó:**
  1. **Relación Atómica Usuarios-Clientes:** Se estableció que cada usuario con rol `cliente` referencia un registro en la tabla `clientes` mediante `cliente_id`. Al registrarse en `POST /api/auth/register`, se crea atómicamente el registro en `clientes` (guardando su ciudad para costos de envío) y en `usuarios` dentro de una transacción.
  2. **Aislamiento Estricto de Órdenes:** En `ordenes.controller.js`, cuando el rol es `cliente`, se ignora cualquier `cliente_id` que venga en la petición y se fuerza el `req.user.cliente_id`. Además, `GET /api/ordenes` filtra estrictamente por su propio `cliente_id`, y `GET /api/ordenes/:id` devuelve un HTTP 403 si el cliente intenta consultar la orden de otro cliente.
  3. **Inhabilitación de Compras para Personal:** El personal de tienda es rechazado con HTTP 403 al intentar enviar órdenes desde el carrito público, obligando a usar las cuentas de clientes para comprar.
  4. **Seguridad y Cookies:** Se configuró `cookie-parser` con `credentials: true` en CORS, cookie `httpOnly`, `sameSite: 'lax'`, y se protegieron todas las rutas administrativas de productos, clientes, cupones y resumen.
  5. **Batería de Pruebas Automatizadas:** Se creó `backend/tests/test_auth.js` con 23 casos de prueba cubriendo registro, login, logout, consulta de sesión, 401 sin sesión, 403 por rol, y aislamiento de órdenes. Adicionalmente, se adaptó `test_endpoints.js` (28 pruebas) para autenticar las peticiones antes de validar la lógica de negocio.
  6. **Diseño Visual en Frontend:** Se implementaron las vistas `/iniciar-sesion` (con pestañas para cliente y personal), `/registro` (exclusivo para clientes) y `/mi-cuenta` (con bienvenida, historial de pedidos y modal de detalles), respetando la estética *"Nube de algodón"*, iconos lineales de Lucide y sin emojis.

