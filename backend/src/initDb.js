import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resuelve la ubicación real de schema.sql buscando ordenadamente:
 * 1. Variable de entorno SCHEMA_FILE (si está definida)
 * 2. Raíz del repositorio (../../schema.sql relativo a backend/src)
 * 3. Carpeta backend (../schema.sql relativo a backend/src)
 * 4. Carpeta backend/src (./schema.sql)
 * 5. Directorio de trabajo actual (process.cwd()/schema.sql)
 */
export function findSchemaPath() {
  const candidatePaths = [
    process.env.SCHEMA_FILE ? path.resolve(process.env.SCHEMA_FILE) : null,
    path.resolve(__dirname, '../../schema.sql'),
    path.resolve(__dirname, '../schema.sql'),
    path.resolve(__dirname, './schema.sql'),
    path.resolve(process.cwd(), 'schema.sql'),
    path.resolve(process.cwd(), '../schema.sql')
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No se encontró el archivo schema.sql. Se verificaron las siguientes rutas:\n` +
    candidatePaths.map(p => ` - ${p}`).join('\n')
  );
}

export function initializeDatabase() {
  const schemaPath = findSchemaPath();
  console.log(`[DB INIT] Leyendo esquema desde: ${schemaPath}`);

  const sql = fs.readFileSync(schemaPath, 'utf-8');
  
  // Ejecutar el script SQL completo de manera reproducible
  db.exec(sql);
  console.log('[DB INIT] Base de datos inicializada exitosamente con schema.sql');
}

// Si se ejecuta directamente desde la línea de comandos (node src/initDb.js o npm run init-db)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('[DB INIT ERROR]', error);
    process.exit(1);
  }
}
