# Frontend - Tienda Online con Inventario, Cupones y Envíos (Laboratorio 2)

Interfaz de usuario moderna y responsiva desarrollada con **React 19**, **Vite** y **React Router**. Toda la información se consume en tiempo real directamente desde el backend API de Express (`http://localhost:3001/api`), sin datos simulados.

---

## 🚀 Requisitos Previos

- **Node.js**: versión 18.x o superior
- **Backend Express**: debe estar ejecutándose en el puerto `3001` (o la URL configurada en `VITE_API_URL`).

---

## 📦 Instalación y Ejecución

### 1. Iniciar el Backend (Terminal 1)
Antes de levantar el frontend, asegúrate de que la base de datos y el servidor backend estén listos:

```bash
cd backend
npm install
npm run init-db     # Inicializa la base de datos SQLite con los datos semilla
npm run start       # Inicia la API en http://localhost:3001
```

### 2. Instalar y Ejecutar el Frontend (Terminal 2)

```bash
cd frontend
npm install         # Instala dependencias (react, react-router-dom, lucide-react, vite)
npm run dev         # Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR)
```

Por defecto, Vite levantará la aplicación en:
👉 **`http://localhost:5173`** (o el siguiente puerto disponible si el 5173 está ocupado).

### 3. Compilación para Producción (Opcional)
Para generar el bundle optimizado de producción:

```bash
npm run build
npm run preview     # Previsualiza la build de producción
```

---

## 🧭 Vistas Implementadas

1. **Dashboard (`/`)**:
   - Consume `GET /api/resumen`.
   - Tarjetas KPI: Ingresos totales, valor promedio por orden, órdenes activas y descuentos otorgados.
   - Gráfica/barras de **Ventas por Categoría** con porcentajes calculados con SQL.
   - Podio de los **Top 3 Productos Más Vendidos** con medallas y unidades vendidas.
   - Distribución de **Órdenes por Estado** (`nueva`, `pagada`, `enviada`, `entregada`, `cancelada`).
   - Sección de **Alertas de Reposición** para productos con stock crítico (&le; 5 unidades).

2. **Catálogo de Productos (`/productos`)**:
   - Consume `GET /api/productos`.
   - Barra de búsqueda interactiva por nombre o descripción.
   - Filtro reactivo por categoría (`Periféricos`, `Audio`, `Monitores`, `Accesorios`).
   - Selector de ordenamiento: por nombre (A-Z), precio (asc/desc) y stock (asc/desc).
   - Modal para **Crear** y **Editar** productos con campos controlados.
   - Integración con asistente IA para generar descripciones comerciales persuasivas.
   - Modal de confirmación para eliminación con borrado lógico cuando existen órdenes históricas asociadas.
   - Visualización explícita de errores devueltos por la API (códigos 400 y 409).

3. **Nueva Orden (`/nueva-orden`)**:
   - Selección de cliente registrado o registro rápido en modal.
   - Selección interactiva de productos con control de stock en tiempo real.
   - Contador de cantidades con validación de límite de inventario.
   - Validación y aplicación de cupones de descuento contra el endpoint `POST /api/cupones/validar` (muestra errores de vigencia, límite global de usos o uso previo por cliente).
   - Cálculo dinámico de costo de envío según la ciudad de entrega y regla de **envío gratis** si el monto neto supera `$50.00`.
   - Envío de la orden a `POST /api/ordenes` ejecutada en transacción atómica.

4. **Gestión y Detalle de Órdenes (`/ordenes`)**:
   - Listado completo de órdenes con filtro por estado.
   - Modal de detalle (`GET /api/ordenes/:id`) mostrando los datos del cliente, cupón aplicado, desglose de ítems comprados y totales.
   - Botón para avanzar estado siguiendo el flujo formal: `nueva` &rarr; `pagada` &rarr; `enviada` &rarr; `entregada`.
   - Botón de **Cancelar orden** (permitido únicamente antes de ser enviada) que activa una transacción atómica en el backend reponiendo el stock de los productos.

5. **Asistente Copilot IA (`/asistente-ia`)**:
   - Laboratorio de prueba de los endpoints de IA (`POST /api/ia/generar-descripcion` y `POST /api/ia/recomendar`).

---

## 🧱 Arquitectura de Componentes Reutilizables

- **`src/services/api.js`**: Única capa de comunicación HTTP (`fetch`) con la API Express. Centraliza la captura de respuestas y formatea errores `{ error: "mensaje" }` para códigos 400, 404 y 409.
- **`src/hooks/useFetch.js`**: Hook personalizado que gestiona reactivamente `{ data, loading, error, refetch }`.
- **`src/components/Layout.jsx`**: Envoltura general con barra de navegación superior, contenedor responsivo y pie de página.
- **`src/components/Navbar.jsx`**: Barra de navegación superior con enlaces activos a cada vista y badge de estado.
- **`src/components/MetricCard.jsx`**: Tarjeta visual para métricas clave con iconos, subtítulos y códigos de color semánticos.
- **`src/components/TableList.jsx`**: Tabla responsive con cabeceras, soporte para acciones por fila y vista de estado vacío cuando no hay registros.
- **`src/components/LoadingState.jsx`**: Spinner animado con mensaje descriptivo para estados de carga asíncrona.
- **`src/components/AlertBox.jsx`**: Cuadro de alerta para errores (400/404/409), advertencias y mensajes de éxito con botón de cierre.
- **`src/components/FormField.jsx`**: Campo de formulario controlado con etiqueta, asterisco de campo obligatorio y mensaje de validación.
- **`src/components/ConfirmModal.jsx`**: Diálogo de confirmación para acciones destructivas (eliminar producto o cancelar orden).
- **`src/components/Modal.jsx`**: Ventana modal accesible con cierre al presionar `Escape` o hacer clic en el backdrop.
- **`src/components/StatusBadge.jsx`**: Insignia con color e icono específico según el estado de la orden.
