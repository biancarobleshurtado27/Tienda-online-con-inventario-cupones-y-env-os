import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { getToyImageUrl, DEFAULT_TOY_IMAGE } from '../../utils/toyImages.js';
import { 
  ShoppingBag, 
  Check, 
  Eye, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, getItemQuantity } = useCart();
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);
  const [errorStock, setErrorStock] = useState(null);

  if (!product) return null;

  const stock = Number(product.stock) || 0;
  const precio = Number(product.precio) || 0;
  const agotado = stock <= 0;
  const enCarrito = getItemQuantity(product.id);

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
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(120, 95, 130, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      <div>
        {/* Imagen del Juguete */}
        <Link 
          to={`/productos/${product.id}`}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            width: '100%',
            height: 195,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: 14,
            position: 'relative',
            backgroundColor: '#F5EFE6',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)'
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

            {/* Badge de Categoría */}
            <span style={{
              position: 'absolute',
              top: 10,
              left: 10,
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 9999,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              color: 'var(--pastel-lavender-text)',
              border: '1px solid rgba(142, 116, 190, 0.25)',
              boxShadow: '0 2px 6px rgba(47, 38, 54, 0.08)',
              backdropFilter: 'blur(4px)'
            }}>
              {product.categoria}
            </span>

            {/* Badge de Stock */}
            <span style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 9999,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              color: agotado ? 'var(--pastel-rose-text)' : (stock <= 5 ? 'var(--pastel-butter-text)' : 'var(--pastel-mint-text)'),
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 6px rgba(47, 38, 54, 0.08)',
              backdropFilter: 'blur(4px)'
            }}>
              {agotado ? 'Agotado' : (stock <= 5 ? `¡Solo ${stock}!`: `${stock} disponibles`)}
            </span>
          </div>
        </Link>

        {/* Nombre del Juguete */}
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.08rem',
          fontWeight: 700,
          marginBottom: 6,
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

        {/* Breve descripción */}
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          marginBottom: 16,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.45
        }}>
          {product.descripcion || 'Juguete artesanal para inspirar el aprendizaje y la diversión.'}
        </p>
      </div>

      <div>
        {/* Precio y estado */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 10,
          borderTop: '1px solid var(--border-color)',
          marginBottom: 12
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>Precio unitario</span>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              ${precio.toFixed(2)}
            </div>
          </div>
          {enCarrito > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pastel-lavender-text)',
              backgroundColor: 'var(--pastel-lavender-light)',
              padding: '2px 8px',
              borderRadius: 8
            }}>
              {enCarrito} en carrito
            </span>
          )}
        </div>

        {/* Notificación de error si intentó superar stock */}
        {errorStock && (
          <div style={{
            fontSize: '0.74rem',
            color: 'var(--danger)',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <AlertCircle size={12} /> {errorStock}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleAddToCart}
            disabled={agotado || (enCarrito >= stock)}
            className="btn btn-primary btn-sm"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: agregadoFeedback ? 'var(--pastel-mint)' : undefined,
              borderColor: agregadoFeedback ? 'var(--pastel-mint)' : undefined
            }}
            title={agotado ? 'Sin existencias' : 'Añadir al carrito mágico'}
          >
            {agregadoFeedback ? (
              <>
                <Check size={15} strokeWidth={2.5} /> ¡Añadido!
              </>
            ) : (
              <>
                <ShoppingBag size={15} strokeWidth={2.2} />
                {agotado ? 'Agotado' : (enCarrito >= stock ? 'Máx. Alcanzado' : 'Al Carrito')}
              </>
            )}
          </button>

          <Link
            to={`/productos/${product.id}`}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 10px',
              textDecoration: 'none'
            }}
            title="Ver detalles completos del juguete"
            aria-label={`Ver detalle de ${product.nombre}`}
          >
            <Eye size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
