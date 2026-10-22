import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Boxes, 
  Sparkles, 
  Dice5, 
  Heart, 
  Palette, 
  Car,
  ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Construcción': { icon: Boxes, bg: 'var(--pastel-butter-light)', color: 'var(--pastel-butter-text)', border: 'var(--pastel-butter-border)' },
  'Muñecas y figuras': { icon: Sparkles, bg: 'var(--pastel-rose-light)', color: 'var(--pastel-rose-text)', border: 'var(--pastel-rose-border)' },
  'Juegos de mesa': { icon: Dice5, bg: 'var(--pastel-lavender-light)', color: 'var(--pastel-lavender-text)', border: 'var(--pastel-lavender-border)' },
  'Peluches': { icon: Heart, bg: 'var(--pastel-mint-light)', color: 'var(--pastel-mint-text)', border: 'var(--pastel-mint-border)' },
  'Arte y manualidades': { icon: Palette, bg: 'var(--pastel-sky-light)', color: 'var(--pastel-sky-text)', border: 'var(--pastel-sky-border)' },
  'Vehículos y Exterior': { icon: Car, bg: 'var(--pastel-butter-light)', color: 'var(--pastel-butter-text)', border: 'var(--pastel-butter-border)' },
};

export default function CategoryCard({ nombre, descripcion, totalProductos }) {
  const meta = CATEGORY_ICONS[nombre] || { 
    icon: Sparkles, 
    bg: 'var(--pastel-lavender-light)', 
    color: 'var(--pastel-lavender-text)',
    border: 'var(--pastel-lavender-border)'
  };
  const Icon = meta.icon;

  return (
    <Link
      to={`/catalogo?categoria=${encodeURIComponent(nombre)}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        textDecoration: 'none',
        color: 'var(--text-main)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        minHeight: 160
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(120, 95, 130, 0.08)';
        e.currentTarget.style.borderColor = meta.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          backgroundColor: meta.bg,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          border: `1px solid ${meta.border}`
        }}>
          <Icon size={24} strokeWidth={2.2} />
        </div>

        <h4 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.08rem',
          fontWeight: 800,
          marginBottom: 4,
          color: 'var(--text-main)'
        }}>
          {nombre}
        </h4>

        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.45
        }}>
          {descripcion || 'Mundos creados para explorar y disfrutar.'}
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 12,
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: meta.color
      }}>
        <span>{totalProductos ? `${totalProductos} modelos` : 'Ver colección'}</span>
        <ChevronRight size={14} strokeWidth={2.5} />
      </div>
    </Link>
  );
}
