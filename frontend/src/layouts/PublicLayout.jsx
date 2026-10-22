import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader.jsx';
import PublicFooter from '../components/public/PublicFooter.jsx';

export default function PublicLayout({ children }) {
  const { pathname, hash } = useLocation();

  // Scroll al inicio en cambio de ruta o al hash si viene con #
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      <PublicHeader />

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
