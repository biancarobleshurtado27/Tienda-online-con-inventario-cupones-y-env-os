import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

/**
 * Protege rutas del panel administrativo que exigen rol 'personal'
 * Si no está autenticado, redirige a /iniciar-sesion guardando el origen
 * Si está autenticado pero con rol 'cliente', redirige a /acceso-denegado
 */
export default function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: 'var(--text-subtle)'
      }}>
        <Loader2 className="animate-spin" size={32} color="var(--pastel-lavender)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cargando panel de gestión...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/iniciar-sesion?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user.rol !== 'personal') {
    return <Navigate to="/acceso-denegado" replace state={{ requiredRole: 'personal', currentRole: user.rol }} />;
  }

  return children;
}
