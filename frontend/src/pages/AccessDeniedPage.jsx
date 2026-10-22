import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requiredRole = location.state?.requiredRole || 'autorizado';

  const handleLogout = async () => {
    await logout();
    navigate('/iniciar-sesion');
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: '36px 32px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 30px rgba(47, 38, 54, 0.06)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 20,
          backgroundColor: '#FFF1F2',
          color: '#E11D48',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          border: '1px solid #FFE4E6'
        }}>
          <ShieldAlert size={28} strokeWidth={2.2} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.6rem',
          color: 'var(--text-main)',
          marginBottom: 10,
          fontWeight: 800
        }}>
          Acceso no autorizado
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: 24
        }}>
          La sección solicitada requiere una cuenta con rol de <strong style={{ color: 'var(--text-main)' }}>{requiredRole}</strong>. 
          Actualmente has iniciado sesión como <strong style={{ color: 'var(--text-main)' }}>{user?.nombre || 'Usuario'}</strong> ({user?.rol || 'sin rol'}).
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <Link
            to={user?.rol === 'personal' ? '/admin' : '/'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(222, 123, 148, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Home size={16} />
            <span>Volver a mi área principal</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 20px',
              backgroundColor: '#FAF7F2',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            <span>Cambiar de cuenta / Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
