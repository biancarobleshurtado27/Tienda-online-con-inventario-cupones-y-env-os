import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { 
  Sparkles, 
  ShoppingBag, 
  Store, 
  BookOpen, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export default function PublicHeader() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Inicio', icon: Compass, end: true },
    { to: '/catalogo', label: 'Catálogo de Juguetes', icon: Store },
    { to: '/#historia', label: 'Nuestra Historia', icon: BookOpen },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 14px rgba(47, 38, 54, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingBottom: 12,
        gap: 16
      }}>
        {/* Logo Textual con detalles de Nube de Algodón */}
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            textDecoration: 'none',
            color: 'var(--text-main)'
          }}
          onClick={handleLinkClick}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: 'var(--pastel-lavender-light)',
            color: 'var(--pastel-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(142, 116, 190, 0.2)'
          }}>
            <Sparkles size={22} strokeWidth={2.3} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              lineHeight: 1.1,
              display: 'block'
            }}>
              Mundo Juguete
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-subtle)',
              letterSpacing: '0.04em'
            }}>
              Fantasía & Recuerdos
            </span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'var(--bg-main)',
          padding: '4px 6px',
          borderRadius: 9999,
          border: '1px solid var(--border-color)',
        }} className="desktop-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 9999,
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(142, 116, 190, 0.3)' : 'none',
                  transition: 'all 0.2s ease'
                })}
              >
                <Icon size={15} strokeWidth={2.2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Acciones de la derecha: Carrito y Menú Móvil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Botón Carrito */}
          <Link
            to="/carrito"
            aria-label={`Carrito de compras con ${totalItems} artículos`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 9999,
              backgroundColor: totalItems > 0 ? 'var(--pastel-rose)' : 'var(--bg-card)',
              color: totalItems > 0 ? '#FFFFFF' : 'var(--text-main)',
              border: totalItems > 0 ? '1px solid var(--pastel-rose)' : '1px solid var(--border-color)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: totalItems > 0 ? '0 4px 14px rgba(222, 123, 148, 0.3)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <ShoppingBag size={18} strokeWidth={2.3} />
            <span style={{ display: 'none' }} className="cart-text">Carrito</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 20,
              padding: '0 6px',
              borderRadius: 9999,
              backgroundColor: totalItems > 0 ? '#FFFFFF' : 'var(--pastel-lavender-light)',
              color: totalItems > 0 ? 'var(--pastel-rose)' : 'var(--pastel-lavender-text)',
              fontSize: '0.75rem',
              fontWeight: 800,
              lineHeight: 1
            }}>
              {totalItems}
            </span>
          </Link>

          {/* Toggle Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Abrir menú"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }} className="mobile-menu">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: isActive ? 'var(--pastel-lavender-light)' : 'transparent'
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
          .cart-text {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
}
