import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductosPage from './pages/ProductosPage.jsx';
import NuevaOrdenPage from './pages/NuevaOrdenPage.jsx';
import OrdenesPage from './pages/OrdenesPage.jsx';
import AsistenteIAPage from './pages/AsistenteIAPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/nueva-orden" element={<NuevaOrdenPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/asistente-ia" element={<AsistenteIAPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
