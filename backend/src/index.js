import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import { initializeDatabase } from './initDb.js';

import productosRoutes from './routes/productos.routes.js';
import cuponesRoutes from './routes/cupones.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import ordenesRoutes from './routes/ordenes.routes.js';
import resumenRoutes from './routes/resumen.routes.js';
import iaRoutes from './routes/ia.routes.js';

dotenv.config();

// Verificar si la base de datos contiene tablas, de lo contrario inicializarla
try {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='productos'").get();
  if (!tableCheck) {
    console.log('[SERVER] Base de datos vacía detectada. Inicializando esquema y datos de prueba...');
    initializeDatabase();
  }
} catch (e) {
  console.log('[SERVER] Inicializando base de datos inicial...');
  initializeDatabase();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Logger simple de peticiones
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/cupones', cuponesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/resumen', resumenRoutes);
app.use('/api/ia', iaRoutes);

// Ruta de estado de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor';

  // Si Express falló parseando JSON malformado enviado por el cliente
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    message = 'JSON malformado en el cuerpo de la solicitud';
  } else if (err.code && typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    status = 409;
    message = `Violación de restricción de integridad de base de datos: ${err.message}`;
  }

  res.status(status).json({
    error: message
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoint de métricas: http://localhost:${PORT}/api/resumen`);
  console.log(`====================================================`);
});

export default app;
