import db from '../db.js';

export const clientesService = {
  getAll() {
    return db.prepare('SELECT * FROM clientes ORDER BY nombre ASC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  },

  create({ nombre, email, ciudad }) {
    if (!nombre || !email || !ciudad) {
      const err = new Error('Nombre, email y ciudad son obligatorios');
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

    if (!ciudad) return 10.00;
    return tarifas[ciudad.trim()] !== undefined ? tarifas[ciudad.trim()] : 10.00;
  }
};
