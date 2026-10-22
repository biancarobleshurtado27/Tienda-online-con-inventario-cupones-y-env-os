import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { isNonEmptyString } from '../utils/validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mundo_juguete_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = '24h';

export const authService = {
  /**
   * Genera un token JWT firmado
   */
  generateToken(usuario) {
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id || null,
      ciudad: usuario.ciudad || null
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  /**
   * Verifica un token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  },

  /**
   * Registro exclusivo para clientes
   * Crea un registro en clientes y en usuarios de manera atómica
   */
  registerCliente({ nombre, email, password, ciudad }) {
    if (!isNonEmptyString(nombre)) {
      const err = new Error('El nombre es obligatorio');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const err = new Error('El correo electrónico no tiene un formato válido');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(password) || password.length < 6) {
      const err = new Error('La contraseña debe tener al menos 6 caracteres');
      err.statusCode = 400;
      throw err;
    }

    if (!isNonEmptyString(ciudad)) {
      const err = new Error('La ciudad es obligatoria');
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre.trim();
    const cleanCiudad = ciudad.trim();

    // Validar si el email ya existe en usuarios o clientes
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE LOWER(email) = ?').get(cleanEmail);
    if (existingUser) {
      const err = new Error('El correo electrónico ya se encuentra registrado');
      err.statusCode = 409;
      throw err;
    }

    // Hashear contraseña con bcrypt
    const password_hash = bcrypt.hashSync(password, 10);

    // Transacción atómica
    const registerTx = db.transaction(() => {
      // 1. Crear o reutilizar cliente existente si tenía el mismo email
      let cliente = db.prepare('SELECT id, nombre, email, ciudad FROM clientes WHERE LOWER(email) = ?').get(cleanEmail);
      if (!cliente) {
        const stmtCliente = db.prepare(`
          INSERT INTO clientes (nombre, email, ciudad)
          VALUES (?, ?, ?)
        `);
        const resCliente = stmtCliente.run(cleanNombre, cleanEmail, cleanCiudad);
        cliente = { id: resCliente.lastInsertRowid, nombre: cleanNombre, email: cleanEmail, ciudad: cleanCiudad };
      }

      // 2. Crear usuario con rol 'cliente'
      const stmtUsuario = db.prepare(`
        INSERT INTO usuarios (nombre, email, password_hash, rol, cliente_id, activo)
        VALUES (?, ?, ?, 'cliente', ?, 1)
      `);
      const resUsuario = stmtUsuario.run(cleanNombre, cleanEmail, password_hash, cliente.id);

      return {
        id: resUsuario.lastInsertRowid,
        nombre: cleanNombre,
        email: cleanEmail,
        rol: 'cliente',
        cliente_id: cliente.id,
        ciudad: cleanCiudad,
        activo: 1
      };
    });

    return registerTx();
  },

  /**
   * Inicio de sesión para cualquier rol (cliente o personal)
   */
  login({ email, password }) {
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Buscar usuario y unir con datos de clientes si aplica
    const usuario = db.prepare(`
      SELECT u.id, u.nombre, u.email, u.password_hash, u.rol, u.cliente_id, u.activo, c.ciudad
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      WHERE LOWER(u.email) = ?
    `).get(cleanEmail);

    if (!usuario) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    if (usuario.activo !== 1) {
      const err = new Error('Esta cuenta ha sido desactivada. Comunícate con el soporte de Mundo Juguete.');
      err.statusCode = 403;
      throw err;
    }

    // Verificar contraseña con bcrypt
    const match = bcrypt.compareSync(password, usuario.password_hash);
    if (!match) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    // Retornar objeto seguro sin password_hash
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
      ciudad: usuario.ciudad || null
    };
  },

  /**
   * Obtener perfil actual a partir del ID de usuario
   */
  getUsuarioById(id) {
    const usuario = db.prepare(`
      SELECT u.id, u.nombre, u.email, u.rol, u.cliente_id, u.activo, c.ciudad
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      WHERE u.id = ?
    `).get(Number(id));

    if (!usuario || usuario.activo !== 1) {
      return null;
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
      ciudad: usuario.ciudad || null
    };
  }
};
