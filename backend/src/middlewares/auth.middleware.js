import { authService } from '../services/auth.service.js';

const COOKIE_NAME = 'token';

/**
 * Middleware que exige sesión autenticada válida (401 si falla)
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME] || req.headers?.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado: debes iniciar sesión' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  // Verificar que el usuario sigue existiendo y activo
  const usuario = authService.getUsuarioById(decoded.id);
  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado o cuenta inactiva' });
  }

  req.user = usuario;
  next();
}

/**
 * Middleware que exige uno de los roles especificados (403 si no coincide)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso no autorizado: debes iniciar sesión' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes para esta acción' });
    }

    next();
  };
}

/**
 * Middleware opcional: si hay token válido, inyecta req.user sin rechazar peticiones públicas
 */
export function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME] || req.headers?.authorization?.replace(/^Bearer\s+/i, '');
  if (token) {
    const decoded = authService.verifyToken(token);
    if (decoded && decoded.id) {
      const usuario = authService.getUsuarioById(decoded.id);
      if (usuario) {
        req.user = usuario;
      }
    }
  }
  next();
}
