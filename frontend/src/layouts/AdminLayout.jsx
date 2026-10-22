import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Store, LogOut, User } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/iniciar-sesion');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FAF7F2'
    }}>
      {/* Barra superior de contexto para el personal */}
      <div style={{
        backgroundColor: 'var(--text-main)',
        color: '#FFFFFF',
        padding: '8px 20px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <ShieldCheck size={16} color="var(--pastel-lavender-border)" strokeWidth={2.3} />
            <span>Panel de Gestión Interna</span>
          </div>

          <span style={{
            backgroundColor: 'var(--pastel-lavender)',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 9999,
            letterSpacing: '0.02em'
          }}>
            Personal de tienda
          </span>

          {user && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.78rem'
            }}>
              <User size={13} />
              <strong>{user.nombre}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              fontSize: '0.76rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: 9999,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
          >
            <Store size={13} strokeWidth={2} />
            <span>Ver Tienda Pública</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 12px',
              borderRadius: 9999,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FECDD3',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; }}
          >
            <LogOut size={13} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Navbar Interno del Personal */}
      <Navbar />

      <main style={{ flex: 1, paddingBottom: 48, paddingTop: 16 }}>
        {children}
      </main>
    </div>
  );
}
