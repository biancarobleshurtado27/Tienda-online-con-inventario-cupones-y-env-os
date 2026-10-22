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
    { to: '/productos', label: 'Productos', icon: Package },
    { to: '/nueva-orden', label: 'Nueva Orden', icon: ShoppingCart },
    { to: '/ordenes', label: 'Órdenes', icon: ClipboardList },
    { to: '/asistente-ia', label: 'Copilot IA', icon: Sparkles, badge: 'n8n' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
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
            color: 'white'
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Store size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              TechStore <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Laboratorio #2 · Caso 5
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
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? '#818cf8' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Server status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
            display: 'inline-block'
          }}></span>
          <span>API :3001 OK</span>
        </div>
      </div>
    </header>
  );
}
