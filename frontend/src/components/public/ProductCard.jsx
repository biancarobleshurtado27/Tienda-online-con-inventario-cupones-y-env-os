import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { getToyImageUrl, DEFAULT_TOY_IMAGE } from '../../utils/toyImages.js';
import { 
  ShoppingBag, 
  Check, 
  Eye, 
  Heart,
  Star,
  AlertCircle
} from 'lucide-react';

const CATEGORY_TAGS = {
  'Construcción': { label: 'NOSTALGIA', color: '#DE7B94', bg: '#FDF1F4', border: '#F7D0DA' },
  'Muñecas y figuras': { label: 'EDICIÓN ESPECIAL', color: '#8E74BE', bg: '#F3EFFB', border: '#DBCFF4' },
  'Juegos de mesa': { label: 'CLÁSICO', color: '#5A9EC4', bg: '#EDF6FC', border: '#C6E0F1' },
  'Peluches': { label: 'EDICIÓN ESPECIAL', color: '#8E74BE', bg: '#F3EFFB', border: '#DBCFF4' },
  'Arte y manualidades': { label: 'CREATIVO', color: '#41A07D', bg: '#EEF8F3', border: '#BFE6D5' },
  'Vehículos y Exterior': { label: 'CLÁSICO', color: '#5A9EC4', bg: '#EDF6FC', border: '#C6E0F1' },
};

const TOY_TAGS = {
  1: ['Pino sostenible', 'Pintura al agua'],
  2: ['Algodón orgánico', 'Lavable'],
  3: ['Madera de haya', 'Ruedas silenciosas'],
  4: ['Estrategia familiar', 'Cartón reciclado'],
  5: ['Tacto mullido', 'Hipoalergénico'],
  6: ['Pigmentos naturales', 'Pincel de bambú'],
  7: ['Madera noble', 'Loop doble'],
  8: ['Trigo natural', 'Sin gluten'],
  9: ['Mecatrónica suave', 'Batería recargable'],
  10: ['Lente de cristal', 'Trípode de madera'],
};

export default function ProductCard({ product }) {
  const { addToCart, getItemQuantity } = useCart();
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);
  const [liked, setLiked] = useState(false);
  const [errorStock, setErrorStock] = useState(null);

  if (!product) return null;

  const stock = Number(product.stock) || 0;
  const precio = Number(product.precio) || 0;
  const agotado = stock <= 0;
  const enCarrito = getItemQuantity(product.id);

  const tagInfo = CATEGORY_TAGS[product.categoria] || {
    label: 'ARTESANAL',
    color: '#8E74BE',
    bg: '#F3EFFB',
    border: '#DBCFF4'
  };

  const featureBadges = TOY_TAGS[product.id] || ['Madera noble', 'Pintura segura'];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (agotado) return;

    const res = addToCart(product, 1);
    if (res.success) {
      setAgregadoFeedback(true);
      setErrorStock(null);
      setTimeout(() => setAgregadoFeedback(false), 1600);
    } else {
      setErrorStock(res.message);
      setTimeout(() => setErrorStock(null), 2500);
    }
  };

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px',
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 18px rgba(120, 95, 130, 0.05)',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(120, 95, 130, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(120, 95, 130, 0.05)';
      }}
    >
      <div>
        {/* Cabecera de la tarjeta: Tag de categoría y botón de favoritos */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <span style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '3px 10px',
            borderRadius: 9999,
            backgroundColor: tagInfo.bg,
            color: tagInfo.color,
            border: `1px solid ${tagInfo.border}`,
            textTransform: 'uppercase'
          }}>
            {tagInfo.label}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
            }}
            aria-label="Agregar a favoritos"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: liked ? '#FDF1F4' : '#FFFFFF',
              color: liked ? '#DE7B94' : 'var(--text-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={14} fill={liked ? '#DE7B94' : 'none'} strokeWidth={2} />
          </button>
        </div>

        {/* Imagen del Juguete */}
        <Link 
          to={`/productos/${product.id}`}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            width: '100%',
            height: 175,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 14,
            position: 'relative',
            backgroundColor: '#F7F3EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={getToyImageUrl(product)} 
              alt={product.nombre}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_TOY_IMAGE;
              }}
            />
          </div>
        </Link>

        {/* Estrellas de Calificación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <div style={{ display: 'flex', color: '#F1B238', gap: 2 }}>
            <Star size={13} fill="#F1B238" strokeWidth={0} />
            <Star size={13} fill="#F1B238" strokeWidth={0} />
            <Star size={13} fill="#F1B238" strokeWidth={0} />
            <Star size={13} fill="#F1B238" strokeWidth={0} />
            <Star size={13} fill="#F1B238" strokeWidth={0} />
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', marginLeft: 3 }}>
            4.9
          </span>
        </div>

        {/* Nombre del Juguete */}
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.02rem',
          fontWeight: 800,
          marginBottom: 8,
          lineHeight: 1.35
        }}>
          <Link 
            to={`/productos/${product.id}`}
            style={{ 
              color: 'var(--text-main)', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
          >
            {product.nombre}
          </Link>
        </h3>

        {/* Etiquetas de características del producto */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {featureBadges.map((badge, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-main)',
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid var(--border-color)'
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Precio y Disponibilidad */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
          borderTop: '1px solid var(--border-color)',
          marginBottom: 12
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.28rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1
            }}>
              ${precio.toFixed(2)} <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>USD</span>
            </div>
          </div>

          <div>
            {agotado ? (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: 'var(--pastel-rose-text)',
                backgroundColor: 'var(--pastel-rose-light)',
                border: '1px solid var(--pastel-rose-border)',
                padding: '3px 8px',
                borderRadius: 9999,
                textTransform: 'uppercase'
              }}>
                Agotado
              </span>
            ) : stock <= 5 ? (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#C57E12',
                backgroundColor: '#FFF4DE',
                border: '1px solid #FCE4B6',
                padding: '3px 8px',
                borderRadius: 9999,
                textTransform: 'uppercase'
              }}>
                Últimas {stock} unid
              </span>
            ) : (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#288562',
                backgroundColor: '#E8F6EF',
                border: '1px solid #BFE6D5',
                padding: '3px 8px',
                borderRadius: 9999,
                textTransform: 'uppercase'
              }}>
                En Stock
              </span>
            )}
          </div>
        </div>

        {errorStock && (
          <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} /> {errorStock}
          </div>
        )}

        {/* Botones de acción: Agregar (Píldora rosa) y Ver Detalle (Ojo circular) */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleAddToCart}
            disabled={agotado || (enCarrito >= stock)}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 9999,
              border: 'none',
              backgroundColor: agregadoFeedback ? 'var(--pastel-mint)' : 'var(--pastel-rose)',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: agotado || (enCarrito >= stock) ? 'not-allowed' : 'pointer',
              opacity: agotado || (enCarrito >= stock) ? 0.5 : 1,
              boxShadow: '0 3px 10px rgba(222, 123, 148, 0.28)',
              transition: 'all 0.2s ease'
            }}
          >
            {agregadoFeedback ? (
              <>
                <Check size={15} strokeWidth={2.5} /> ¡Añadido!
              </>
            ) : (
              <>
                <ShoppingBag size={15} strokeWidth={2.2} />
                {agotado ? 'Agotado' : (enCarrito >= stock ? 'Máx. Añadido' : 'Agregar')}
              </>
            )}
          </button>

          <Link
            to={`/productos/${product.id}`}
            aria-label={`Ver detalle de ${product.nombre}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-main)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            title="Ver detalles completos"
          >
            <Eye size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
