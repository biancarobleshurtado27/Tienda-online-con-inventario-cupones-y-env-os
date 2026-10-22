import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Boxes, 
  Sparkles, 
  Dice5, 
  Heart, 
  Palette, 
  Car,
  ArrowRight
} from 'lucide-react';

const CATEGORY_META = {
  'Construcción': { 
    icon: Boxes, 
    bg: '#FFF8E6', 
    color: '#D6A429', 
    border: '#F9E8B8',
    modelos: '28 modelos',
    descripcion: 'Bloques de madera, encajes y torres que desafían el equilibrio y la gravedad más elemental.'
  },
  'Muñecas y figuras': { 
    icon: Sparkles, 
    bg: '#FDF1F4', 
    color: '#DE7B94', 
    border: '#F7D0DA',
    modelos: '34 modelos',
    descripcion: 'Amigos de tela, personajes de madera y títeres de suave tacto para historias cotidianas.'
  },
  'Juegos de mesa': { 
    icon: Dice5, 
    bg: '#F3EFFB', 
    color: '#8E74BE', 
    border: '#DBCFF4',
    modelos: '19 modelos',
    descripcion: 'Primeras partidas, desafíos de memoria y risas compartidas en rondas de familia.'
  },
  'Peluches': { 
    icon: Heart, 
    bg: '#EDF6FC', 
    color: '#5A9EC4', 
    border: '#C6E0F1',
    modelos: '15 modelos',
    descripcion: 'Ternura de felpa, ositos mullidos y compañeros inseparables de sueños y siestas.'
  },
  'Arte y manualidades': { 
    icon: Palette, 
    bg: '#EEF8F3', 
    color: '#41A07D', 
    border: '#BFE6D5',
    modelos: '22 modelos',
    descripcion: 'Acuarelas botánicas, ceras naturales y plastilinas no tóxicas para manos creativas.'
  },
  'Vehículos y Exterior': { 
    icon: Car, 
    bg: '#EDF6FC', 
    color: '#3B7A9E', 
    border: '#BFD9EB',
    modelos: '11 modelos',
    descripcion: 'Trenecitos rodantes, carritos de arrastre y cuerdas suaves para jugar al aire libre.'
  },
};

export default function CategoryCard({ nombre, descripcion, totalModelos }) {
  const meta = CATEGORY_META[nombre] || { 
    icon: Sparkles, 
    bg: '#F3EFFB', 
    color: '#8E74BE', 
    border: '#DBCFF4',
    modelos: 'Colección',
    descripcion: 'Juguetes conscientes para crecer y soñar.'
  };
  const Icon = meta.icon;

  return (
    <Link
      to={`/catalogo?categoria=${encodeURIComponent(nombre)}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 22px',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid var(--border-color)',
        textDecoration: 'none',
        color: 'var(--text-main)',
        boxShadow: '0 4px 16px rgba(120, 95, 130, 0.04)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        minHeight: 180
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(120, 95, 130, 0.08)';
        e.currentTarget.style.borderColor = meta.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(120, 95, 130, 0.04)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div>
        {/* Fila superior: Icono en círculo pastel y badge de modelos */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: meta.bg,
            color: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${meta.border}`
          }}>
            <Icon size={20} strokeWidth={2.2} />
          </div>

          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-subtle)',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            padding: '3px 10px',
            borderRadius: 9999
          }}>
            {totalModelos || meta.modelos}
          </span>
        </div>

        {/* Título de la Categoría */}
        <h4 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.12rem',
          fontWeight: 800,
          marginBottom: 6,
          color: 'var(--text-main)'
        }}>
          {nombre}
        </h4>

        {/* Descripción de la Categoría */}
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.5
        }}>
          {descripcion || meta.descripcion}
        </p>
      </div>

      {/* Enlace inferior */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        paddingTop: 14,
        marginTop: 10,
        fontSize: '0.82rem',
        fontWeight: 700,
        color: 'var(--text-main)'
      }}>
        <span>Ver colección</span>
        <ArrowRight size={14} strokeWidth={2.4} />
      </div>
    </Link>
  );
}
