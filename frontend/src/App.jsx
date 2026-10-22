import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Route Guards
import CustomerRoute from './components/routes/CustomerRoute.jsx';
import StaffRoute from './components/routes/StaffRoute.jsx';
import PublicRoute from './components/routes/PublicRoute.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Páginas Públicas para Clientes
import HomePage from './pages/public/HomePage.jsx';
import CatalogPage from './pages/public/CatalogPage.jsx';
import ProductDetailPage from './pages/public/ProductDetailPage.jsx';
import CartPage from './pages/public/CartPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import MyAccountPage from './pages/public/MyAccountPage.jsx';
import AccessDeniedPage from './pages/AccessDeniedPage.jsx';

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
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* ========================================================
                  ÁREA PÚBLICA (Catálogo, Producto, Carrito, Auth)
                  ======================================================== */}
              <Route path="/" element={<PublicRoute><PublicLayout><HomePage /></PublicLayout></PublicRoute>} />
              <Route path="/catalogo" element={<PublicRoute><PublicLayout><CatalogPage /></PublicLayout></PublicRoute>} />
              <Route path="/productos/:id" element={<PublicRoute><PublicLayout><ProductDetailPage /></PublicLayout></PublicRoute>} />
              <Route path="/carrito" element={<PublicRoute><PublicLayout><CartPage /></PublicLayout></PublicRoute>} />
              <Route path="/iniciar-sesion" element={<PublicRoute><PublicLayout><LoginPage /></PublicLayout></PublicRoute>} />
              <Route path="/registro" element={<PublicRoute><PublicLayout><RegisterPage /></PublicLayout></PublicRoute>} />
              <Route path="/acceso-denegado" element={<PublicRoute><PublicLayout><AccessDeniedPage /></PublicLayout></PublicRoute>} />

              {/* ========================================================
                  ÁREA EXCLUSIVA DE CLIENTE (Mi Cuenta e Historial de Órdenes)
                  ======================================================== */}
              <Route
                path="/mi-cuenta"
                element={
                  <CustomerRoute>
                    <PublicLayout>
                      <MyAccountPage />
                    </PublicLayout>
                  </CustomerRoute>
                }
              />

              {/* ========================================================
                  ÁREA INTERNA DEL PERSONAL (ADMIN PROTEGIDA)
                  ======================================================== */}
              <Route
                path="/admin"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <DashboardPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <DashboardPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <ProductosPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />
              <Route
                path="/admin/nueva-orden"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <NuevaOrdenPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />
              <Route
                path="/admin/ordenes"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <OrdenesPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />
              <Route
                path="/admin/asistente-ia"
                element={
                  <StaffRoute>
                    <AdminLayout>
                      <AsistenteIAPage />
                    </AdminLayout>
                  </StaffRoute>
                }
              />

              {/* ========================================================
                  RUTAS DE COMPATIBILIDAD Y REDIRECCIONES
                  ======================================================== */}
              <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
              <Route path="/nueva-orden" element={<Navigate to="/admin/nueva-orden" replace />} />
              <Route path="/ordenes" element={<Navigate to="/admin/ordenes" replace />} />
              <Route path="/asistente-ia" element={<Navigate to="/admin/asistente-ia" replace />} />

              {/* Ruta no encontrada */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
