import React from 'react';
import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: 48, paddingTop: 16 }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 0',
        textAlign: 'center',
        fontSize: '0.825rem',
        color: 'var(--text-subtle)',
        backgroundColor: 'var(--bg-main)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>
            Laboratorio #2 · Mundo Juguete · Juguetería Online con Inventario, Cupones y Envíos
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            API Express Conectada: <code>localhost:3001</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
