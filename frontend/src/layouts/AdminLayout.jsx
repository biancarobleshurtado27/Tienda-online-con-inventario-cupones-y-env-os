import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { ShieldCheck, Store, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }) {
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
        padding: '6px 16px',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <ShieldCheck size={14} color="var(--pastel-lavender-border)" strokeWidth={2.3} />
          <span>Panel de Gestión Interna · Área del Personal</span>
        </div>

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
            padding: '3px 10px',
            borderRadius: 9999,
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
        >
          <Store size={13} strokeWidth={2} />
          <span>Ver Tienda Pública para Clientes</span>
        </Link>
      </div>

      {/* Navbar Interno del Personal */}
      <Navbar />

      <main style={{ flex: 1, paddingBottom: 48, paddingTop: 16 }}>
        {children}
      </main>
    </div>
  );
}
