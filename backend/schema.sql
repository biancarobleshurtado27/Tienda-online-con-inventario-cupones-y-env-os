-- ==========================================================
-- Laboratorio #2 - Caso 5: Tienda online con inventario, cupones y envíos
-- Base de Datos Relacional: SQLite reproducible
-- ==========================================================

PRAGMA foreign_keys = ON;

-- Eliminar tablas existentes en orden inverso de dependencias referenciales
DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS cupones;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS productos;

-- 1. Tabla de Catálogo de Productos
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria TEXT NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- 2. Tabla de Clientes
CREATE TABLE clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    ciudad TEXT NOT NULL
);

-- 3. Tabla de Cupones de Descuento
CREATE TABLE cupones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    porcentaje REAL NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    vigente_hasta TEXT NOT NULL, -- Formato ISO YYYY-MM-DD
    usos_maximos INTEGER NOT NULL CHECK (usos_maximos > 0)
);

-- 4. Tabla de Órdenes (Encabezado)
CREATE TABLE ordenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    cupon_id INTEGER REFERENCES cupones(id),
    estado TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'pagada', 'enviada', 'entregada', 'cancelada')),
    fecha TEXT NOT NULL, -- Formato ISO YYYY-MM-DD HH:MM:SS
    subtotal REAL NOT NULL CHECK (subtotal >= 0),
    descuento REAL NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    envio REAL NOT NULL DEFAULT 0 CHECK (envio >= 0),
    total REAL NOT NULL CHECK (total >= 0)
);

-- 5. Tabla de Ítems de la Orden (Detalle)
CREATE TABLE orden_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario REAL NOT NULL CHECK (precio_unitario > 0)
);

-- Índices para optimizar consultas frecuentes y llaves foráneas
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cupon_id ON ordenes(cupon_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_orden_id ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto_id ON orden_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- ==========================================================
-- Datos Iniciales de Prueba (Seed Data Reproducible)
-- ==========================================================

-- Clientes en distintas provincias y ciudades de Costa Rica
INSERT INTO clientes (id, nombre, email, ciudad) VALUES
(1, 'Carlos Mora', 'carlos.mora@example.com', 'San José'),
(2, 'Lucía Fernández', 'lucia.f@example.com', 'Heredia'),
(3, 'Esteban Gómez', 'esteban.g@example.com', 'Alajuela'),
(4, 'Mariana Rojas', 'mariana.r@example.com', 'Cartago'),
(5, 'David Valverde', 'david.v@example.com', 'Puntarenas'),
(6, 'Sofía Castillo', 'sofia.c@example.com', 'Guanacaste'),
(7, 'Roberto Morales', 'roberto.m@example.com', 'Limón');

-- Catálogo de productos en diversas categorías, precios y niveles de stock
-- (Incluye productos con stock crítico <= 5 para probar alertas de reposición en /api/resumen)
INSERT INTO productos (id, nombre, descripcion, precio, stock, categoria, activo) VALUES
(1, 'Teclado Mecánico RGB', 'Teclado switch blue con iluminación RGB personalizable y cable mallado', 65.00, 15, 'Periféricos', 1),
(2, 'Mouse Ergonómico Inalámbrico', 'Sensor óptico de alta precisión 4000 DPI con batería recargable', 35.00, 20, 'Periféricos', 1),
(3, 'Monitor Gamer 24" 144Hz', 'Panel IPS Full HD con tiempo de respuesta de 1ms y FreeSync', 180.00, 8, 'Monitores', 1),
(4, 'Auriculares Bluetooth Cancelación Ruido', 'Audio Hi-Res con cancelación activa de ruido y 30h de batería', 85.00, 12, 'Audio', 1),
(5, 'Soporte de Aluminio para Laptop', 'Ajustable en 6 niveles ergonómicos con almohadillas antideslizantes', 25.00, 30, 'Accesorios', 1),
(6, 'Micrófono USB Condensador', 'Patrón cardioide con filtro antipop y trípode para streaming', 55.00, 10, 'Audio', 1),
(7, 'Webcam 1080p con Micrófono Estéreo', 'Autoenfoque inteligente y obturador de privacidad integrado', 45.00, 4, 'Periféricos', 1),
(8, 'Cable HDMI 2.1 8K Ultra Alta Velocidad', '2 metros de longitud, conectores chapados en oro 48Gbps', 15.00, 40, 'Accesorios', 1),
(9, 'Hub USB-C 7 en 1 Multifuncional', 'Salida HDMI 4K, 3 puertos USB 3.0, lector SD y carga rápida 100W', 40.00, 3, 'Accesorios', 1),
(10, 'Disco Sólido SSD NVMe 1TB Gen4', 'Velocidad de lectura de hasta 5000 MB/s con disipador térmico de grafeno', 95.00, 14, 'Almacenamiento', 1);

-- Cupones para validar reglas de negocio:
-- 1. Vigentes con usos disponibles ('BIENVENIDO10', 'SUPERTECH20')
-- 2. Con límite de usos reducido para prueba de saturación ('BLACKFRIDAY50')
-- 3. Vencido por fecha ('VENCIDO15' expiró para validar rechazo HTTP 409)
INSERT INTO cupones (id, codigo, porcentaje, vigente_hasta, usos_maximos) VALUES
(1, 'BIENVENIDO10', 10.0, '2026-12-31', 50),
(2, 'SUPERTECH20', 20.0, '2026-12-31', 10),
(3, 'BLACKFRIDAY50', 50.0, '2026-12-31', 2),
-- Cupón con fecha pasada para validar reglas de expiración y pruebas automatizadas (409 Conflict)
(4, 'VENCIDO15', 15.0, '2023-01-01', 100);

-- Órdenes representativas que cubren todos los estados válidos:
-- ('nueva', 'pagada', 'enviada', 'entregada', 'cancelada')
-- Demuestran cálculo de subtotal, descuento, reglas de envío y exclusión en métricas.

-- Orden 1: Carlos Mora (San José) -> PAGADA con cupón BIENVENIDO10 (10% descuento)
-- Subtotal: 65 + 35 = 100.00 | Descuento: 10.00 | Envío: 0.00 (monto neto >= 50) | Total: 90.00
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(1, 1, 1, 'pagada', '2026-10-15 10:30:00', 100.00, 10.00, 0.00, 90.00);

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 65.00),
(1, 2, 1, 35.00);

-- Orden 2: Lucía Fernández (Heredia) -> ENTREGADA sin cupón (orden cerrada no cancelable)
-- Subtotal: 180.00 | Descuento: 0.00 | Envío: 0.00 (monto >= 50) | Total: 180.00
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(2, 2, NULL, 'entregada', '2026-10-18 14:15:00', 180.00, 0.00, 0.00, 180.00);

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(2, 3, 1, 180.00);

-- Orden 3: Esteban Gómez (Alajuela) -> ENVIADA sin cupón
-- Subtotal: 40.00 (menor a 50 -> aplica tarifa Alajuela $7.00) | Descuento: 0.00 | Envío: 7.00 | Total: 47.00
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(3, 3, NULL, 'enviada', '2026-10-19 16:45:00', 40.00, 0.00, 7.00, 47.00);

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(3, 5, 1, 25.00),
(3, 8, 1, 15.00);

-- Orden 4: Mariana Rojas (Cartago) -> NUEVA con cupón SUPERTECH20 (20% descuento)
-- Subtotal: 85.00 | Descuento: 17.00 | Envío: 0.00 (neto 68 >= 50) | Total: 68.00
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(4, 4, 2, 'nueva', '2026-10-20 11:00:00', 85.00, 17.00, 0.00, 68.00);

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(4, 4, 1, 85.00);

-- Orden 5: David Valverde (Puntarenas) -> CANCELADA (Demuestra que /api/resumen excluye órdenes canceladas)
-- Subtotal: 55.00 | Descuento: 0.00 | Envío: 0.00 | Total: 55.00
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(5, 5, NULL, 'cancelada', '2026-10-21 09:10:00', 55.00, 0.00, 0.00, 55.00);

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(5, 6, 1, 55.00);
