import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductosPage from './pages/ProductosPage.jsx';
import NuevaOrdenPage from './pages/NuevaOrdenPage.jsx';
import OrdenesPage from './pages/OrdenesPage.jsx';
import AsistenteIAPage from './pages/AsistenteIAPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ flex: 1, paddingBottom: 40 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/nueva-orden" element={<NuevaOrdenPage />} />
            <Route path="/ordenes" element={<OrdenesPage />} />
            <Route path="/asistente-ia" element={<AsistenteIAPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '20px 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-subtle)',
          backgroundColor: 'var(--bg-main)'
        }}>
          <div className="container">
            Laboratorio #2 · React + Node.js + Base de Datos Relacional + IA Copilot (n8n) · Caso 5: Tienda Online
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
