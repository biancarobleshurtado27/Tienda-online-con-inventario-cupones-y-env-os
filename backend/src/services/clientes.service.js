import db from '../db.js';
import { isValidId, isNonEmptyString } from '../utils/validators.js';

export const clientesService = {
  getAll() {
    return db.prepare('SELECT * FROM clientes ORDER BY nombre ASC').all();
  },

  getById(id) {
    if (!isValidId(id)) {
      return null;
    }
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(Number(id));
  },

  create({ nombre, email, ciudad }) {
    if (!isNonEmptyString(nombre)) {
      const err = new Error('El nombre del cliente es obligatorio y debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const err = new Error('El correo electrónico es inválido');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(ciudad)) {
      const err = new Error('La ciudad es obligatoria y debe ser una cadena de texto');
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM clientes WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      const err = new Error('Ya existe un cliente registrado con este correo electrónico');
      err.statusCode = 409;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO clientes (nombre, email, ciudad)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(nombre.trim(), cleanEmail, ciudad.trim());
    return this.getById(result.lastInsertRowid);
  },

  // Obtener costo de envío base por ciudad
  calcularCostoEnvio(ciudad) {
    const tarifas = {
      'San José': 5.00,
      'Heredia': 6.00,
      'Alajuela': 7.00,
      'Cartago': 8.00,
      'Puntarenas': 10.00,
      'Guanacaste': 12.00,
      'Limón': 12.00
    };

    if (!ciudad || typeof ciudad !== 'string') return 10.00;
    const cleanCiudad = ciudad.trim();
    return tarifas[cleanCiudad] !== undefined ? tarifas[cleanCiudad] : 10.00;
  }
};
