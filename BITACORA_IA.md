# Bitácora de Interacción con Asistente de IA (Copiloto)
**Laboratorio #2 - React + Node.js + Base de Datos + IA**  
**Caso 5: Tienda online con inventario, cupones y envíos**  
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
