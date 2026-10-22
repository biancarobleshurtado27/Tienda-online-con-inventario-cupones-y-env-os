import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Sparkles,
  Store
} from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/productos', label: 'Juguetes', icon: Package },
    { to: '/nueva-orden', label: 'Nueva Orden', icon: ShoppingCart },
    { to: '/ordenes', label: 'Órdenes', icon: ClipboardList },
    { to: '/asistente-ia', label: 'Copilot IA', icon: Sparkles, badge: 'n8n' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 12px rgba(47, 38, 54, 0.03)'
    }}>
      <div className="container" style={{
        paddingTop: 12,
        paddingBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <NavLink 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            textDecoration: 'none',
            color: 'var(--text-main)'
          }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--pastel-rose) 0%, var(--pastel-lavender) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(222, 123, 148, 0.25)',
            flexShrink: 0
          }}>
            <Store size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-main)'
            }}>
              Mundo Juguete
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'var(--pastel-butter-light)',
                color: 'var(--pastel-butter-text)',
                border: '1px solid rgba(214, 164, 41, 0.3)'
              }}>
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
              Juguetería Online · Laboratorio #2
            </div>
          </div>
        </NavLink>

        {/* Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 9999,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  transition: 'all var(--transition-fast)',
                  backgroundColor: isActive ? 'var(--pastel-lavender-light)' : 'transparent',
                  color: isActive ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(142, 116, 190, 0.25)' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(142, 116, 190, 0.12)' : 'none'
                })}
              >
                <Icon size={17} strokeWidth={2.2} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'var(--pastel-rose-light)',
                    color: 'var(--pastel-rose-text)',
                    border: '1px solid rgba(222, 123, 148, 0.25)',
                    fontWeight: 800,
                    letterSpacing: '0.02em'
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Server status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.75rem',
          color: 'var(--text-subtle)',
          backgroundColor: 'var(--surface-card)',
          padding: '6px 12px',
          borderRadius: 9999,
          border: '1px solid var(--border-color)',
          fontWeight: 600
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-mint)',
            boxShadow: '0 0 6px rgba(65, 160, 125, 0.4)',
            display: 'inline-block'
          }}></span>
          <span>API :3001 Conectada</span>
        </div>
      </div>
    </header>
  );
}
