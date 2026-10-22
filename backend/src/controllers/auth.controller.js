import { authService } from '../services/auth.service.js';

const COOKIE_NAME = 'token';

// Opciones seguras para cookie httpOnly
const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000 // 24 horas
});

export const authController = {
  /**
   * Registro exclusivo de clientes
   * POST /api/auth/register
   */
  register(req, res) {
    try {
      const { nombre, email, password, ciudad } = req.body || {};
      const usuario = authService.registerCliente({ nombre, email, password, ciudad });

      // Generar y almacenar token en cookie httpOnly
      const token = authService.generateToken(usuario);
      res.cookie(COOKIE_NAME, token, getCookieOptions());

      res.status(201).json({
        ok: true,
        mensaje: 'Cliente registrado exitosamente',
        usuario
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  /**
   * Inicio de sesión para cualquier rol
   * POST /api/auth/login
   */
  login(req, res) {
    try {
      const { email, password } = req.body || {};
      const usuario = authService.login({ email, password });

      const token = authService.generateToken(usuario);
      res.cookie(COOKIE_NAME, token, getCookieOptions());

      res.status(200).json({
        ok: true,
        mensaje: 'Inicio de sesión exitoso',
        usuario
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  },

  /**
   * Cierre de sesión
   * POST /api/auth/logout
   */
  logout(req, res) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({
      ok: true,
      mensaje: 'Sesión cerrada correctamente'
    });
  },

  /**
   * Consultar sesión actual
   * GET /api/auth/me
   */
  me(req, res) {
    try {
      // req.user fue inyectado por requireAuth o verifyToken
      const token = req.cookies?.[COOKIE_NAME] || req.headers?.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) {
        return res.status(401).json({ error: 'No existe una sesión activa' });
      }

      const decoded = authService.verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }

      const usuario = authService.getUsuarioById(decoded.id);
      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }

      res.status(200).json({
        ok: true,
        usuario
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
};
