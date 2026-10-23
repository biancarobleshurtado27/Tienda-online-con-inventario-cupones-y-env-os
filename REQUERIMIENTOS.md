# 📋 Archivo de Requerimientos y Checklist - Laboratorio #2

> **Documento Oficial de Requerimientos y Seguimiento**  
> **Proyecto:** Juguetería Online *"Mundo Juguete"*  
> **Asignatura:** Desarrollo Front End · React + Node.js + Base de Datos + IA  
> **Caso Asignado:** **Caso 5 — Tienda online con inventario, cupones y envíos**  
> **Estudiante:** Daniel Ortiz Rivera  
> **Modalidad:** Individual  

---

## 📌 1. Resumen Ejecutivo y Estado General del Proyecto

| Bloque Evaluativo | Ponderación | Estado Actual | Cumplimiento |
|---|:---:|:---:|:---:|
| **1. Base de datos y API REST** | 25% | **Completado al 100%** | ✅ 25% / 25% |
| **2. Lógica de negocio y transacciones** | 25% | **Completado al 100%** | ✅ 25% / 25% |
| **3. Frontend en React (SPA)** | 20% | **Completado al 100%** | ✅ 20% / 20% |
| **4. Agente de IA (n8n + Webhook)** | 10% | **Completado al 100%** | ✅ 10% / 10% |
| **5. Uso de IA y Bitácora (`BITACORA_IA.md`)** | 10% | **Completado al 100%** | ✅ 10% / 10% |
| **6. Entregables, README y Defensa** | 10% | **Completado al 100%** | ✅ 10% / 10% |
| **TOTAL** | **100%** | **PROYECTO LISTO PARA DEFENSA** | **100%** |

---

## 🗂️ 2. Checklist de Requerimientos Técnicos Generales

### 2.1 Backend y Base de Datos (Día 1)
- [x] **1. Base de datos relacional con al menos 3 tablas relacionadas, llaves foráneas y restricciones:**
  - Tablas creadas: `productos`, `clientes`, `cupones`, `ordenes`, `orden_items` y `usuarios` (6 tablas en total, superando las 3 mínimas).
  - Llaves foráneas con integridad referencial estricta (`PRAGMA foreign_keys = ON`).
  - Restricciones `NOT NULL`, `UNIQUE` (email de cliente, código de cupón) y `CHECK` (`precio > 0`, `stock >= 0`, `cantidad > 0`, `porcentaje BETWEEN 1 AND 100`, estados permitidos).
  - *Ubicación:* [`schema.sql`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/schema.sql).
  - *Prueba de verificación:* `npm run test:schema --prefix backend` (7/7 pruebas superadas).

- [x] **2. API REST propia con arquitectura por capas:**
  - Estructura limpia y desacoplada: `routes/`, `controllers/`, `services/`, `middlewares/`, `db.js`.
  - CRUD completo para al menos dos recursos:
    - **Recurso `productos`:** `GET /api/productos`, `GET /api/productos/:id`, `POST /api/productos`, `PUT /api/productos/:id`, `DELETE /api/productos/:id`.
    - **Recurso `cupones`:** `GET /api/cupones`, `POST /api/cupones`, `POST /api/cupones/validar`.
    - **Recurso `ordenes`:** `GET /api/ordenes`, `POST /api/ordenes`, `PATCH /api/ordenes/:id/estado`, `PATCH /api/ordenes/:id/cancelar`.
  - Endpoint `GET /:id` con datos relacionados: `GET /api/ordenes/:id` devuelve la orden, los datos del cliente, datos del cupón aplicado y el desglose de items con el nombre de cada producto.
  - *Ubicación:* [`backend/src/routes/`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/routes/) y [`backend/src/services/`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/services/).

- [x] **3. Códigos de estado HTTP semánticos y estándar de error `{ error: "mensaje" }`:**
  - `200 OK`: Consultas exitosas y actualizaciones regulares.
  - `201 Created`: Creación de recursos (`POST /api/productos`, `POST /api/ordenes`, `POST /api/auth/register`).
  - `400 Bad Request`: Validaciones de entrada (precios negativos, formato de IDs inválido, campos requeridos faltantes).
  - `401 Unauthorized`: Acceso no autenticado.
  - `403 Forbidden`: Intento de acceso a recursos de otro rol o cliente ajeno.
  - `404 Not Found`: Recurso inexistente (producto u orden no encontrados).
  - `409 Conflict`: Conflictos de reglas de negocio (stock insuficiente, cupón expirado o agotado, cancelación no permitida).
  - Todos los errores se responden estrictamente bajo `{ error: "mensaje" }`.
  - *Ubicación:* [`backend/src/utils/errors.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/utils/validators.js) y controladores.

- [x] **4. Reglas de negocio validadas en el servidor:**
  - El backend nunca confía en los datos calculados por el frontend; recalcula subtotales, descuentos de cupones, tarifas de envío y totales directamente en la capa de servicios.
  - *Ubicación:* [`backend/src/services/ordenes.service.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/services/ordenes.service.js).

- [x] **5. Transacciones atómicas (ACID):**
  - Toda operación que modifica múltiples tablas se ejecuta dentro de `db.transaction(() => { ... })()`.
  - Al confirmar orden: se valida stock, se crea cabecera de orden, se insertan items y se descuenta stock de forma atómica; si algo falla, se produce ROLLBACK sin descontar stock parcial.
  - Al cancelar orden: se actualiza el estado a `cancelada` y se repone el stock de todos los items en la misma transacción.
  - *Ubicación:* [`backend/src/services/ordenes.service.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/services/ordenes.service.js#L140-L240).

- [x] **6. Endpoint de métricas agregadas SQL `GET /api/resumen`:**
  - Calcula ventas totales agrupadas por categoría (`SUM`, `GROUP BY`).
  - Top 3 productos más vendidos por unidades (`ORDER BY SUM(cantidad) DESC LIMIT 3`).
  - Valor promedio por orden (`COALESCE(AVG(total), 0)`), total de órdenes e ingresos netos.
  - *Ubicación:* [`backend/src/services/resumen.service.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/src/services/resumen.service.js).

- [x] **7. Configuración segura y sanitización:**
  - Variables de entorno cargadas con `dotenv` en `.env` (`PORT`, `DATABASE_FILE`, `JWT_SECRET`, `FRONTEND_URL`, `N8N_WEBHOOK_URL`).
  - Todas las consultas a la base de datos están parametrizadas con `better-sqlite3` (`?`), imposibilitando inyección SQL.
  - Archivo [`.gitignore`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/.gitignore) configurado ignorando `node_modules/`, `.env` y bases de datos locales.

---

### 2.2 Frontend React e Integración con IA (Día 2)
- [x] **1. React Router con múltiples vistas (mínimo 4):**
  - La aplicación cuenta con 11 rutas activas:
    1. `/`: Portada principal (*Hero*, categorías y juguetes destacados).
    2. `/catalogo`: Catálogo completo con buscador, filtros y ordenación.
    3. `/productos/:id`: Detalle del juguete con datos técnicos y relacionados.
    4. `/carrito`: Carrito con cálculo de envío y validación de cupones.
    5. `/mi-cuenta`: Perfil del cliente con historial de sus órdenes.
    6. `/iniciar-sesion`: Acceso para clientes y personal.
    7. `/registro`: Formulario de alta para clientes.
    8. `/admin`: Panel de métricas e indicadores de negocio.
    9. `/admin/productos`: Gestión de inventario (CRUD).
    10. `/admin/ordenes`: Supervisión y cambio de estados de órdenes.
    11. `/admin/nueva-orden`: Asistente de pedidos internos con IA.
    12. `/admin/asistente-ia`: Centro de pruebas del agente n8n.
  - *Ubicación:* [`frontend/src/App.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/App.jsx).

- [x] **2. Capa de servicios centralizada y Custom Hook (`useFetch`):**
  - Módulo [`frontend/src/services/api.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/services/api.js) centraliza todas las llamadas HTTP con `fetch`, manejo homogéneo de errores y credenciales (`credentials: 'include'`).
  - Custom Hook [`frontend/src/hooks/useFetch.js`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/hooks/useFetch.js) gestiona de forma reactiva los tres estados: `{ data, loading, error, refetch }`.

- [x] **3. Formularios controlados con validación y captura de errores de la API (400 y 409):**
  - Formulario de creación/edición de productos: valida nombre, categoría, precio positivo y stock entero.
  - Formulario de checkout y cupones: captura errores 409 (cupón vencido, usos agotados, cliente repetido) y los muestra visualmente sin recargar.
  - Formulario de autenticación y registro: validación de contraseñas y detección de correos duplicados (409).
  - *Ubicaciones:* [`frontend/src/pages/ProductosPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/ProductosPage.jsx) y [`frontend/src/pages/public/CartPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/public/CartPage.jsx).

- [x] **4. Búsqueda por texto, filtrado por categoría y criterio de ordenamiento:**
  - Búsqueda en tiempo real por nombre de producto.
  - Filtro por categoría (*Construcción, Muñecas, Didácticos, Aire Libre, Juegos de Mesa*).
  - Ordenación por precio ascendente, descendente y alfabético.
  - *Ubicación:* [`frontend/src/pages/public/CatalogPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/public/CatalogPage.jsx).

- [x] **5. Panel de métricas que consume `/api/resumen`:**
  - Visualización de tarjetas de KPIs: ventas totales, valor promedio por orden, total de órdenes activas y descuentos otorgados.
  - Tabla de ventas por categoría y ranking visual de los 3 productos más vendidos.
  - Alertas de reposición de inventario en tiempo real.
  - *Ubicación:* [`frontend/src/pages/DashboardPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/DashboardPage.jsx).

- [x] **6. Agente de IA en n8n mediante Webhook con contrato `{ ok, data, error }`:**
  - Workflow exportado en [`n8n_workflow.json`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/n8n_workflow.json).
  - Webhook de entrada que evalúa la acción solicitada (`generar_descripcion` o `recomendar`).
  - Nodo *AI Agent* conectado a modelo LLM con salida estructurada bajo el contrato obligatorio `{ ok: true, data: { ... }, error: null }` o `{ ok: false, data: null, error: "..." }`.
  - Integrado transparentemente en:
    - Editor de productos ([`ProductosPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/ProductosPage.jsx)).
    - Carrito de compras del cliente ([`CartPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/public/CartPage.jsx)).
    - Creación manual de órdenes ([`NuevaOrdenPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/NuevaOrdenPage.jsx)).
    - Banco interactivo de pruebas ([`AsistenteIAPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/AsistenteIAPage.jsx)).

- [x] **7. Arquitectura de componentes modulares y reutilizables:**
  - Tarjetas de métricas: [`MetricCard.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/MetricCard.jsx).
  - Mensajes y alertas: [`AlertBox.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/AlertBox.jsx).
  - Modales de confirmación: [`ConfirmModal.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/ConfirmModal.jsx).
  - Estado de carga y errores: [`LoadingState.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/LoadingState.jsx), [`ErrorBoundary.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/ErrorBoundary.jsx).
  - Ítems y tarjetas de catálogo: [`ProductCard.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/public/ProductCard.jsx), [`CartItem.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/components/public/CartItem.jsx).

---

## 🎯 3. Checklist Específico del CASO 5: "Tienda online con inventario, cupones y envíos"

| Requisito Específico del Caso 5 | Estado | Implementación y Evidencia |
|---|:---:|---|
| **Regla 1: Control de stock y transacción al confirmar**<br>No se puede pedir más que el stock disponible. Al confirmar la orden el stock se descuenta en una transacción. Rechazo con 409 si no hay existencias. | **HECHO** ✅ | Validado en `ordenes.service.js`. Consolida ítems duplicados, verifica stock en SQLite y ejecuta `UPDATE productos SET stock = stock - ?` dentro de `db.transaction`. Testeado en `test_endpoints.js`. |
| **Regla 2: Envío por ciudad y envío gratuito**<br>El costo de envío depende de la ciudad del cliente y es gratis si el subtotal con descuento supera un monto definido ($50.00 / $100.00). | **HECHO** ✅ | Servicio `clientes.service.js` y endpoint `GET /api/clientes/calcular-envio`. Matriz de costos por ciudad en Costa Rica con exención automática de costo si `subtotal >= 50.00`. |
| **Regla 3: Validación estricta de cupones**<br>Un cupón solo aplica si está vigente, no superó sus usos máximos y el cliente no lo ha usado antes. | **HECHO** ✅ | Endpoint `POST /api/cupones/validar` y servicio `cupones.service.js`. Valida vigencia por fecha, compara `COUNT(*)` de usos contra `usos_maximos` y verifica que el `cliente_id` no tenga órdenes previas activas con ese cupón (rechaza con HTTP 409). |
| **Regla 4: Flujo de estados y cancelación con reposición**<br>Flujo `nueva` → `pagada` → `enviada` → `entregada`. Solo se cancela antes de ser enviada y repone el stock. | **HECHO** ✅ | `PATCH /api/ordenes/:id/estado` valida transiciones legales. `PATCH /api/ordenes/:id/cancelar` rechaza con 409 órdenes en estado `enviada` o `entregada`, y repone el stock en transacción atómica para órdenes `nueva` o `pagada`. |
| **Regla 5: Panel de métricas del caso**<br>Ventas por categoría, los 3 productos más vendidos y valor promedio por orden. | **HECHO** ✅ | `GET /api/resumen` agrupa por `categoria`, calcula el Top 3 por volumen de ventas y el ticket promedio con `COALESCE(AVG(total), 0)`. Representado en `/admin` con gráficos de barra e insignias. |
| **IA Funcionalidad 1: Descripción comercial**<br>Genera descripción comercial a partir del nombre y la categoría del producto. | **HECHO** ✅ | Workflow de n8n (acción `generar_descripcion`) e integrado al formulario de alta/edición de juguetes con botón "✨ Generar descripción con IA". |
| **IA Funcionalidad 2: Recomendador de carrito**<br>Recomienda productos relacionados con lo que el cliente tiene en su carrito. | **HECHO** ✅ | Workflow de n8n (acción `recomendar`) conectado a `/carrito`, `/admin/nueva-orden` y `/admin/asistente-ia`. Los productos recomendados pueden añadirse con 1 clic al carrito. |
| **Reto Extra Opcional: Alertas de reposición**<br>Alertas de reposición para productos que se agotarían con el ritmo de ventas. | **HECHO** ✅ | Calculado en `resumen.service.js` bajo `alertas_reposicion` (detecta productos con stock crítico <= 5 o agotados) y desplegado con alertas visuales en el Dashboard gerencial. |

---

## 📦 4. Checklist de Entregables Oficiales

| Entregable Solicitado en la Rúbrica | Estado | Ubicación en el Repositorio |
|---|:---:|---|
| **1. Código del Backend (`backend/`)** | **HECHO** ✅ | [`backend/`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/backend/) completo con dependencias y scripts. |
| **2. Código del Frontend (`frontend/`)** | **HECHO** ✅ | [`frontend/`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/) con Vite, React Router y estilos listos. |
| **3. Script de Base de Datos (`schema.sql`)** | **HECHO** ✅ | [`schema.sql`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/schema.sql) con tablas, restricciones y datos de ejemplo. |
| **4. Colección de Thunder Client / Postman** | **HECHO** ✅ | [`thunder-collection_laboratorio2.json`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/thunder-collection_laboratorio2.json) con todos los casos (200, 201, 400, 404, 409). |
| **5. Workflow exportado de n8n** | **HECHO** ✅ | [`n8n_workflow.json`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/n8n_workflow.json) exportado en formato JSON sin credenciales sensibles. |
| **6. Documentación general (`README.md`)** | **HECHO** ✅ | [`README.md`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/README.md) con caso, diagrama ER, guía de inicio y tabla de endpoints. |
| **7. Bitácora de Copiloto IA (`BITACORA_IA.md`)** | **HECHO** ✅ | [`BITACORA_IA.md`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/BITACORA_IA.md) con 6 prompts detallados (exige mínimo 5), respuestas y correcciones. |
| **8. Batería de Pruebas Automatizadas** | **HECHO** ✅ | 3 suites: `verify_schema.js` (7/7), `test_endpoints.js` (28/28), `test_auth.js` (23/23). |

---

## 🔍 5. Auditoría de Elementos Faltantes o Acciones Realizadas

| Elemento Auditado | Diagnóstico Inicial | Acción Ejecutada para Cumplir al 100% | Estado Final |
|---|---|---|:---:|
| **Recomendaciones de IA en Carrito Real del Cliente (`CartPage.jsx`)** | Estaba implementado en el área administrativa (`NuevaOrdenPage.jsx`) y en la página de pruebas (`AsistenteIAPage.jsx`), pero no directamente en la vista del carrito público del cliente (`/carrito`). | Se integró el recomendador en vivo dentro de [`CartPage.jsx`](file:///c:/Users/NVGWf/OneDrive/Documents/Programacion/BackEnd/semana2/10-21/laboratorio2/frontend/src/pages/public/CartPage.jsx) con botón para solicitar sugerencias y botón para añadir directamente los juguetes recomendados al carrito. | **COMPLETADO** ✅ |
| **Inicialización y Pruebas del Backend** | El servidor no estaba levantado en el background y requería verificar la base de datos `tienda.db`. | Se ejecutó `npm run init-db`, se levantó el servidor Express en puerto 3001 y se corrieron las suites automatizadas pasando 58 de 58 pruebas. | **COMPLETADO** ✅ |
| **Compilación de Producción del Frontend** | No se había verificado la compilación limpia de Vite. | Se ejecutó `npm run build` en el frontend, transformando 2000 módulos exitosamente sin errores de sintaxis ni de tipos. | **COMPLETADO** ✅ |

---

## 🚀 6. Guía Rápida para la Demostración y Defensa

Para la presentación individual y defensa del código ante el docente:

### Paso 1: Inicializar y Levantar el Backend
```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Paso 2: Ejecutar el Frontend
```bash
cd frontend
npm install
npm run dev
```

### Paso 3: Ejecutar la Batería Completa de Pruebas en Vivo
```bash
# Terminal adicional (dentro de backend)
npm run test:schema        # 7 pruebas de restricciones SQL y FK
node tests/test_endpoints.js # 28 pruebas de endpoints y reglas 409
node tests/test_auth.js      # 23 pruebas de cookies y roles
```

### Paso 4: Casos Clave a Mostrar en la Demostración
1. **Regla de Negocio 409 (Stock insuficiente):** Intentar comprar una cantidad mayor a la disponible en inventario desde el carrito.
2. **Regla de Negocio 409 (Cupón vencido o agotado):** Aplicar el cupón `VENCIDO15` en el carrito.
3. **Transacción y Reposición:** Cancelar una orden en estado `nueva` desde `/admin/ordenes` y verificar cómo el stock del producto aumenta de inmediato en `/admin/productos`.
4. **Agente de IA (n8n):** Mostrar la generación de descripción de un juguete nuevo en `/admin/productos` o las sugerencias automáticas de productos para el carrito en `/carrito`.
