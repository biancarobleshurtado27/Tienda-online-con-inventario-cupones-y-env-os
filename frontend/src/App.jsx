import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Páginas Públicas para Clientes
import HomePage from './pages/public/HomePage.jsx';
import CatalogPage from './pages/public/CatalogPage.jsx';
import ProductDetailPage from './pages/public/ProductDetailPage.jsx';
import CartPage from './pages/public/CartPage.jsx';

// Páginas Internas para el Personal
import DashboardPage from './pages/DashboardPage.jsx';
import ProductosPage from './pages/ProductosPage.jsx';
import NuevaOrdenPage from './pages/NuevaOrdenPage.jsx';
import OrdenesPage from './pages/OrdenesPage.jsx';
import AsistenteIAPage from './pages/AsistenteIAPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <CartProvider>
          <Routes>
            {/* ========================================================
                ÁREA PÚBLICA PARA CLIENTES
                ======================================================== */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
            <Route path="/productos/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
            <Route path="/carrito" element={<PublicLayout><CartPage /></PublicLayout>} />

            {/* ========================================================
                ÁREA INTERNA DEL PERSONAL (ADMIN)
                ======================================================== */}
            <Route path="/admin" element={<AdminLayout><DashboardPage /></AdminLayout>} />
            <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
            <Route path="/admin/productos" element={<AdminLayout><ProductosPage /></AdminLayout>} />
            <Route path="/admin/nueva-orden" element={<AdminLayout><NuevaOrdenPage /></AdminLayout>} />
            <Route path="/admin/ordenes" element={<AdminLayout><OrdenesPage /></AdminLayout>} />
            <Route path="/admin/asistente-ia" element={<AdminLayout><AsistenteIAPage /></AdminLayout>} />

            {/* ========================================================
                RUTAS DE COMPATIBILIDAD Y REDIRECCIONES
                ======================================================== */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
            <Route path="/nueva-orden" element={<Navigate to="/admin/nueva-orden" replace />} />
            <Route path="/ordenes" element={<Navigate to="/admin/ordenes" replace />} />
            <Route path="/asistente-ia" element={<Navigate to="/admin/asistente-ia" replace />} />

            {/* Ruta no encontrada: Redirigir a inicio público */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
