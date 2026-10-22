import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sparkles,
  Store,
  Search,
  ShoppingCart,
  User,
  Package,
  Layers,
  Shapes
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/productos', label: 'Catálogo & Editor' },
    { to: '/admin/nueva-orden', label: 'Crear Orden' },
    { to: '/admin/ordenes', label: 'Gestión de Órdenes' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/admin/productos?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(47, 38, 54, 0.03)'
    }}>
      <div className="container" style={{
        paddingTop: 10,
        paddingBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <NavLink 
          to="/admin" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            textDecoration: 'none',
            color: 'var(--text-main)'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F39EA8 0%, #B79FE2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(243, 158, 168, 0.25)',
            flexShrink: 0
          }}>
            <Shapes size={20} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.18rem',
              letterSpacing: '-0.01em',
              color: '#342639',
              lineHeight: 1.15
            }}>
              Mundo Juguete
            </div>
            <div style={{ fontSize: '0.72rem', color: '#978B9B', fontWeight: 500 }}>
              Historias que inspiran sonrisas
            </div>
          </div>
        </NavLink>

        {/* Navigation links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#FBF8F5',
          padding: '4px 6px',
          borderRadius: 9999,
          border: '1px solid #EFE8DF'
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                padding: '6px 16px',
                borderRadius: 9999,
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? '#ED849A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#6A5E70',
                boxShadow: isActive ? '0 2px 8px rgba(237, 132, 154, 0.3)' : 'none'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right tools: Search, AI button, Cart, Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search 
              size={15} 
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A095A6' }} 
            />
            <input
              type="text"
              placeholder="Buscar maravillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#FBF8F5',
                border: '1px solid #EFE8DF',
                borderRadius: 9999,
                padding: '7px 14px 7px 32px',
                fontSize: '0.8rem',
                color: '#342639',
                outline: 'none',
                width: 170,
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#C5B5D6'; e.target.style.width = '200px'; }}
              onBlur={(e) => { e.target.style.borderColor = '#EFE8DF'; e.target.style.width = '170px'; }}
            />
          </form>

          {/* AI Copilot Button */}
          <NavLink
            to="/admin/asistente-ia"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#EDE7F6',
              color: '#7C55C7',
              border: '1px solid #DFD5F0',
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={14} strokeWidth={2.4} />
            <span>Asistente AI</span>
          </NavLink>

          {/* Cart Icon button */}
          <NavLink
            to="/admin/nueva-orden"
            title="Crear Nueva Orden Interna"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#FBF8F5',
              border: '1px solid #EFE8DF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#342639',
              position: 'relative',
              textDecoration: 'none'
            }}
          >
            <ShoppingCart size={17} strokeWidth={2.2} />
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              backgroundColor: '#ED849A',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: 9999,
              padding: '1px 5px',
              minWidth: 16,
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              5
            </span>
          </NavLink>

          {/* User Avatar */}
          <div
            title="Perfil de Usuario"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#6A5372',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <User size={18} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </header>
  );
}
