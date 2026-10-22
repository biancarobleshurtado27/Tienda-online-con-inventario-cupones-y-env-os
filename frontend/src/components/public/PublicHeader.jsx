import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { 
  Sparkles, 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function PublicHeader() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/#historia', label: 'Sobre nosotros' },
    { to: '/#contacto', label: 'En contacto' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 12px rgba(47, 38, 54, 0.03)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
        gap: 16
      }}>
        {/* Brand / Logo */}
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            textDecoration: 'none',
            color: 'var(--text-main)',
            flexShrink: 0
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: 'var(--pastel-lavender-light)',
            color: 'var(--pastel-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(142, 116, 190, 0.18)',
            border: '1px solid var(--pastel-lavender-border)'
          }}>
            <Sparkles size={20} strokeWidth={2.3} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              lineHeight: 1.1,
              display: 'block'
            }}>
              Mundo Juguete
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-subtle)',
              letterSpacing: '0.02em'
            }}>
              Juguetes que inspiran sonrisas
            </span>
          </div>
        </Link>

        {/* Navegación Central tipo Píldoras */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#FAF7F2',
          padding: '4px',
          borderRadius: 9999,
          border: '1px solid var(--border-color)'
        }} className="desktop-nav">
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              style={({ isActive }) => {
                const active = item.to === '/' ? location.pathname === '/' : (isActive && location.pathname !== '/');
                return {
                  padding: '6px 18px',
                  borderRadius: 9999,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--pastel-rose)' : 'transparent',
                  boxShadow: active ? '0 2px 8px rgba(222, 123, 148, 0.3)' : 'none',
                  transition: 'all 0.18s ease'
                };
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sección Derecha: Buscador, Carrito, Botón Área Taller y Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Buscador de píldora */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ position: 'relative', display: 'none' }}
            className="search-form"
          >
            <Search 
              size={15} 
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} 
            />
            <input
              type="text"
              placeholder="Buscar juguetes mágicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: 190,
                height: 36,
                padding: '0 12px 0 34px',
                borderRadius: 9999,
                border: '1px solid var(--border-color)',
                backgroundColor: '#FAF7F2',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.width = '220px'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.width = '190px'; }}
            />
          </form>

          {/* Botón Carrito con Badge */}
          <Link
            to="/carrito"
            aria-label={`Carrito de compras con ${totalItems} artículos`}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#FAF7F2',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FAF7F2'; }}
          >
            <ShoppingBag size={18} strokeWidth={2.2} />
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              backgroundColor: 'var(--pastel-rose)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              borderRadius: 9999,
              padding: '1px 5px',
              minWidth: 17,
              textAlign: 'center',
              lineHeight: 1.2,
              boxShadow: '0 2px 5px rgba(222, 123, 148, 0.4)'
            }}>
              {totalItems}
            </span>
          </Link>

          {/* Botón Área del Taller / Acceso Personal */}
          <Link
            to="/admin"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--pastel-lavender-light)',
              color: 'var(--pastel-lavender-text)',
              border: '1px solid rgba(142, 116, 190, 0.25)',
              padding: '7px 14px',
              borderRadius: 9999,
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            className="workshop-pill"
          >
            <Sparkles size={14} strokeWidth={2.4} />
            <span>Área del taller</span>
          </Link>

          {/* Avatar del Usuario */}
          <div
            title="Perfil de Usuario"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#4A3D52',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <User size={18} strokeWidth={2.2} />
          </div>

          {/* Toggle Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Abrir menú"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
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
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.92rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'var(--text-main)'
              }}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.92rem',
              fontWeight: 700,
              textDecoration: 'none',
              color: 'var(--pastel-lavender-text)',
              backgroundColor: 'var(--pastel-lavender-light)'
            }}
          >
            <Sparkles size={16} />
            <span>Acceso al Área del Taller</span>
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .search-form {
            display: block !important;
          }
          .workshop-pill {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
