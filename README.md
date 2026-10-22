# Laboratorio #2 - Caso 5: Tienda Online con Inventario, Cupones y Envíos

> **Materia:** Programación Web & BackEnd  
> **Estudiante:** Daniel Ortiz Rivera  
> **Caso de Estudio:** Caso 5 - Tienda Online con control de inventario en transacciones ACID, validación estricta de cupones, cálculo de tarifas de envío, métricas de agregación SQL e integración con Agente de IA en n8n.

---

## 📋 Resumen del Proyecto

Este repositorio contiene la solución de extremo a extremo para el **Laboratorio 2 (Caso 5)**, estructurada en una arquitectura profesional desacoplada:

1. **Base de Datos Relacional (`schema.sql`):** Esquema SQLite con llaves foráneas (`PRAGMA foreign_keys = ON`), restricciones de integridad `CHECK`, transacciones ACID e inserción de datos iniciales (*seed data*).
2. **Backend API REST (`/backend`):** Servidor Node.js con Express organizado por capas (`routes/`, `controllers/`, `services/`, `db.js`), validaciones con códigos de estado HTTP apropiados (200, 201, 400, 404, 409) y soporte de transacciones atómicas con `better-sqlite3`.
3. **Frontend React SPA (`/frontend`):** Aplicación cliente construida con Vite, React 19, React Router (mínimo 4 vistas con navegación activa), servicio centralizado de peticiones (`services/api.js`), Custom Hook `useFetch` con manejo unificado de estados (`data`, `loading`, `error`, `refetch`), formularios controlados y filtros combinados con búsqueda y ordenamiento en tiempo real.
4. **Automatización & Agente IA (`n8n_workflow.json`):** Flujo de trabajo exportado para n8n con Webhook entrante, router condicional (*Switch*), Agente LangChain para generación de descripciones comerciales persuasivas, motor de recomendaciones de carrito y contrato estandarizado `{ ok, data, error }`.
5. **Colección de Pruebas:** Archivo de Thunder Client (`thunder-collection_laboratorio2.json`) y suite automatizada de pruebas HTTP (`backend/tests/test_endpoints.js`).

---

## 🏛️ Arquitectura del Sistema

```
laboratorio2/
├── schema.sql                         # DDL y DML de base de datos relacional (SQLite)
├── n8n_workflow.json                  # Workflow exportado de n8n para el Agente IA
├── thunder-collection_laboratorio2.json # Pruebas funcionales de Thunder Client
├── BITACORA_IA.md                     # Registro de interacción y prompts con IA Copilot
├── README.md                          # Documentación completa del proyecto
│
├── backend/                           # Servidor Express por capas
│   ├── .env                           # Variables de entorno (PORT, DATABASE_FILE, N8N_URL)
│   ├── .env.example                   # Plantilla de variables de entorno
│   ├── package.json                   # Dependencias (express, better-sqlite3, cors, dotenv)
│   ├── data/
│   │   └── tienda.db                  # Base de datos SQLite generada
│   ├── tests/
│   │   └── test_endpoints.js          # Script de pruebas automatizadas de endpoints
│   └── src/
│       ├── index.js                   # Punto de entrada Express y registro de routers
│       ├── db.js                      # Conexión persistente better-sqlite3 con foreign keys
│       ├── initDb.js                  # Inicializador y ejecutor de schema.sql
│       ├── routes/                    # Enrutadores Express (Rutas HTTP)
│       │   ├── productos.routes.js
│       │   ├── cupones.routes.js
│       │   ├── clientes.routes.js
│       │   ├── ordenes.routes.js
│       │   ├── resumen.routes.js
│       │   └── ia.routes.js
│       ├── controllers/               # Controladores HTTP (Manejo de req, res y códigos HTTP)
│       │   ├── productos.controller.js
│       │   ├── cupones.controller.js
│       │   ├── clientes.controller.js
│       │   ├── ordenes.controller.js
│       │   ├── resumen.controller.js
│       │   └── ia.controller.js
│       └── services/                  # Capa de negocio y consultas SQL (Transacciones ACID)
│           ├── productos.service.js
│           ├── cupones.service.js
│           ├── clientes.service.js
│           ├── ordenes.service.js
│           ├── resumen.service.js
│           └── ia.service.js
│
└── frontend/                          # Cliente React 19 + Vite
    ├── package.json                   # Dependencias (react, react-dom, react-router-dom, lucide-react)
    ├── vite.config.js                 # Configuración de compilación Vite
    ├── index.html                     # HTML5 semántico
    └── src/
        ├── main.jsx                   # Montaje del Virtual DOM
        ├── App.jsx                    # Enrutador principal (React Router con 5 vistas)
        ├── index.css                  # Sistema de diseño, variables CSS y estilos globales
        ├── App.css                    # Clases utilitarias
        ├── services/
        │   └── api.js                 # Cliente API único con manejo unificado de errores
        ├── hooks/
        │   └── useFetch.js            # Custom Hook para peticiones { data, loading, error, refetch }
        ├── components/                # Componentes reutilizables
        │   ├── Navbar.jsx             # Barra de navegación con indicador de ruta activa
        │   ├── MetricCard.jsx         # Tarjetas de indicadores numéricos (KPIs)
        │   ├── StatusBadge.jsx        # Insignias visuales de estado de órdenes
        │   ├── AlertBox.jsx           # Banners de alerta para éxito, advertencia o error
        │   └── Modal.jsx              # Modal accesible con backdrop y tecla Escape
        └── pages/                     # Vistas principales del sistema
            ├── DashboardPage.jsx      # Vista 1: Panel de Analítica con agregaciones de /api/resumen
            ├── ProductosPage.jsx      # Vista 2: Catálogo con CRUD, filtros, orden y generación IA
            ├── NuevaOrdenPage.jsx     # Vista 3: Formulario reactivo de checkout y validación de cupones
            ├── OrdenesPage.jsx        # Vista 4: Gestión de pedidos, flujo de estados y cancelación
            └── AsistenteIAPage.jsx    # Vista 5: Laboratorio interactivo del Agente IA (n8n)
```

---

## 🗄️ Modelo de Base de Datos Relacional (`schema.sql`)

El esquema de base de datos implementa las cinco entidades del Caso 5 con integridad referencial estricta:

1. **`productos`**: Catálogo con precio positivo (`CHECK (precio > 0)`), control de existencias (`CHECK (stock >= 0)`), categoría y bandera `activo`.
2. **`clientes`**: Identificación de compradores, correo único (`email UNIQUE`) y ciudad para el cálculo tarifario de despacho.
3. **`cupones`**: Reglas de descuento porcentual (`CHECK (porcentaje > 0 AND porcentaje <= 100)`), fecha de expiración (`vigente_hasta`) y límite de usos permitidos (`usos_maximos > 0`).
4. **`ordenes`**: Encabezado del pedido con cliente, cupón opcional, estado restringido a `CHECK (estado IN ('nueva', 'pagada', 'enviada', 'entregada', 'cancelada'))`, fecha ISO, subtotal, descuento, costo de envío y total.
5. **`orden_items`**: Detalle en cascada (`ON DELETE CASCADE`) con cantidad positiva (`CHECK (cantidad > 0)`) y precio unitario histórico capturado en el momento de la venta.

---

## ⚙️ Reglas de Negocio Implementadas

### 1. Transacciones Atómicas para Órdenes (`db.transaction`)
- Al crear una orden (`POST /api/ordenes`), se ejecuta una transacción ACID que:
  - Valida la disponibilidad de stock de cada producto solicitado. Si algún ítem no tiene inventario suficiente, revierte toda la operación y retorna un error con código **HTTP 409 (Conflict)**.
  - Descuenta inmediatamente el inventario en la tabla `productos`.
  - Calcula el subtotal histórico multiplicando cantidades por precios vigentes.
  - Inserta la cabecera en `ordenes` y todos los renglones en `orden_items`.
- Al cancelar una orden (`PATCH /api/ordenes/:id/cancelar`), dentro de una transacción atómica se revierte el estado a `'cancelada'` y se **repone el stock** a cada producto involucrado. Solo se permite cancelar pedidos en estado `'nueva'` o `'pagada'`; si ya fue `'enviada'` o `'entregada'`, se rechaza con **HTTP 409**.

### 2. Validación de Cupones con HTTP 409
Un cupón se evalúa bajo 4 restricciones:
- Existencia en el catálogo.
- Fecha actual no superior a `vigente_hasta`.
- Cantidad de usos globales registrados en órdenes activas no superior a `usos_maximos`.
- El cliente no debe haber canjeado previamente dicho cupón en órdenes vigentes.
- Si no cumple cualquiera de estas condiciones, se rechaza con **HTTP 409 (Conflict)** y mensaje explicativo.

### 3. Matriz Tarifaria de Envíos
- El costo de envío se determina según la ciudad de destino del cliente registrado:
  - San José: `$3.50`
  - Heredia: `$4.00`
  - Alajuela: `$4.50`
  - Cartago: `$5.00`
  - Puntarenas / otras provincias: `$7.00`
- **Regla de Envío Gratuito:** Si el monto neto `(subtotal - descuento) >= $50.00`, el costo de envío es automáticamente `$0.00`.

### 4. Agregaciones SQL en `/api/resumen`
El endpoint calcula en la base de datos sin procesar loops en memoria:
- `SUM(oi.cantidad * oi.precio_unitario)` agrupado por categoría (`GROUP BY p.categoria`).
- Top 3 productos más vendidos calculados por unidades vendidas (`SUM(oi.cantidad) DESC LIMIT 3`).
- Total de órdenes activas (`COUNT(*)`), total recaudado (`COALESCE(SUM(total), 0)`), valor promedio por orden (`COALESCE(AVG(total), 0)`), recaudo de envíos y descuentos otorgados.
- Alertas de reposición de stock crítico para productos con existencias &le; 5 unidades.

---

## 🤖 Integración con n8n (Agente IA)

El archivo [`n8n_workflow.json`](./n8n_workflow.json) contiene la especificación completa del flujo:

- **Nodo Webhook (`POST /webhook/tienda-ai`):** Recibe solicitudes del backend mediante `fetch`.
- **Nodo Switch (`Evaluar Acción`):** Desvía según el parámetro `action`:
  - `generar_descripcion`: Redacta una descripción comercial profesional basada en el nombre y categoría del producto.
  - `recomendar_carrito`: Analiza los productos actuales del carrito y sugiere artículos complementarios.
- **Nodo LangChain AI Agent:** Procesa los prompts utilizando un modelo de lenguaje.
- **Nodos de Código JavaScript:** Formatean y garantizan el contrato unificado:
  ```json
  {
    "ok": true,
    "data": { ... },
    "error": null
  }
  ```
- **Fallback de Alta Disponibilidad:** En [`backend/src/services/ia.service.js`](./backend/src/services/ia.service.js), si la instancia de n8n no se encuentra en línea, el backend recurre a un generador heurístico local manteniendo el mismo contrato sin interrumpir la experiencia de usuario.

---

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
- Node.js versión 18 o superior (probado en Node v22).
- npm instalado.

### 1. Inicializar la Base de Datos
```bash
cd backend
npm install
npm run init-db
```
Esto creará el archivo SQLite en `backend/data/tienda.db` a partir de `schema.sql`.

### 2. Ejecutar el Servidor Backend
```bash
cd backend
npm run dev
# El servidor estará disponible en http://localhost:3001
# Endpoint de métricas: http://localhost:3001/api/resumen
```

### 3. Ejecutar las Pruebas Automatizadas del Backend
Con el backend en ejecución, corre en otra terminal:
```bash
cd backend
npm run test-endpoints
```

### 4. Ejecutar el Frontend React
```bash
cd frontend
npm install
npm run dev
# La aplicación abrirá en http://localhost:5173
```

---

## 📊 Vistas del Frontend

| Vista | Ruta | Descripción |
|---|---|---|
| **Dashboard** | `/` | KPIs en tiempo real, desglose de ventas por categoría con barra de progreso, podio de los 3 productos más vendidos, distribución de estados y alertas de stock crítico. |
| **Catálogo de Productos** | `/productos` | CRUD completo (crear, editar, eliminar), buscador por texto, filtro reactivo por categoría, ordenamiento multidireccional por precio, nombre y stock, e integración con el Agente IA para redactar descripciones comerciales. |
| **Nueva Orden** | `/nueva-orden` | Checkout con selección de cliente, adición y remoción reactiva de productos, control de stock en carrito, cálculo en vivo de envío según ciudad, aplicación y validación de cupones con feedback de errores 409. |
| **Gestión de Órdenes** | `/ordenes` | Tabla de pedidos con filtro por estado (`nueva`, `pagada`, `enviada`, `entregada`, `cancelada`), visualización modal de ítems históricos con precios de compra, avance secuencial de estados y cancelación con reposición automática de stock. |
| **Asistente IA** | `/asistente-ia` | Laboratorio interactivo para probar los dos casos de uso de IA (generación de descripciones comerciales y recomendación inteligente de productos para el carrito) consumiendo el contrato n8n. |

---

## 📬 Endpoints de la API

| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| `GET` | `/api/productos` | Lista productos activos con soporte para `?categoria=`, `?busqueda=` y `?orden=` | 200 |
| `GET` | `/api/productos/:id` | Obtiene un producto por ID | 200, 404 |
| `POST` | `/api/productos` | Crea un nuevo producto validando campos | 201, 400 |
| `PUT` | `/api/productos/:id` | Actualiza un producto existente | 200, 400, 404 |
| `DELETE` | `/api/productos/:id` | Elimina producto (soft-delete si tiene órdenes asociadas) | 200, 404 |
| `GET` | `/api/cupones` | Lista cupones con conteo de usos actuales | 200 |
| `POST` | `/api/cupones/validar` | Valida vigencia, límite de usos y uso único por cliente | 200, 409 |
| `GET` | `/api/clientes` | Lista los clientes registrados con su ciudad | 200 |
| `POST` | `/api/clientes` | Registra un nuevo cliente | 201, 400 |
| `GET` | `/api/ordenes` | Lista órdenes con filtro opcional `?estado=` | 200 |
| `GET` | `/api/ordenes/:id` | Obtiene el detalle de la orden con sus renglones e ítems | 200, 404 |
| `POST` | `/api/ordenes` | Crea una orden con transacción ACID, validando y descontando stock | 201, 400, 404, 409 |
| `PATCH` | `/api/ordenes/:id/estado` | Avanza el estado de la orden en el flujo secuencial | 200, 400, 404, 409 |
| `PATCH` | `/api/ordenes/:id/cancelar` | Cancela la orden y repone el stock atómicamente | 200, 404, 409 |
| `GET` | `/api/resumen` | Retorna métricas calculadas con SUM, COUNT, GROUP BY y alertas de inventario | 200 |
| `POST` | `/api/ia/generar-descripcion` | Genera descripción comercial mediante webhook n8n o fallback | 200, 400 |
| `POST` | `/api/ia/recomendar-carrito` | Genera recomendaciones complementarias para el carrito | 200 |
#   T i e n d a - o n l i n e - c o n - i n v e n t a r i o - c u p o n e s - y - e n v - o s  
 