import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { DEFAULT_TOY_IMAGE } from '../../utils/toyImages.js';
import { Plus, Minus, Trash2, AlertCircle } from 'lucide-react';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  if (!item) return null;

  const stock = Number(item.stock) || 0;
  const cantidad = Number(item.cantidad) || 1;
  const precio = Number(item.precio) || 0;
  const lineTotal = precio * cantidad;
  const isAtMaxStock = cantidad >= stock;

  const handleDecrement = () => {
    if (cantidad <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, cantidad - 1);
    }
  };

  const handleIncrement = () => {
    if (!isAtMaxStock) {
      updateQuantity(item.id, cantidad + 1);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      gap: 16,
      flexWrap: 'wrap'
    }}>
      {/* Miniatura y Detalles del Juguete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 240px', minWidth: 0 }}>
        <Link to={`/productos/${item.id}`} style={{ flexShrink: 0 }}>
          <img
            src={item.imagen || DEFAULT_TOY_IMAGE}
            alt={item.nombre}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              objectFit: 'cover',
              border: '1px solid var(--border-color)',
              display: 'block'
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_TOY_IMAGE;
            }}
          />
        </Link>

        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'var(--pastel-lavender-text)',
            backgroundColor: 'var(--pastel-lavender-light)',
            padding: '2px 8px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 4
          }}>
            {item.categoria}
          </span>

          <h4 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.98rem',
            fontWeight: 700,
            margin: '0 0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <Link 
              to={`/productos/${item.id}`} 
              style={{ color: 'var(--text-main)', textDecoration: 'none' }}
            >
              {item.nombre}
            </Link>
          </h4>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ${precio.toFixed(2)} c/u · <span style={{ color: stock <= 5 ? 'var(--pastel-butter-text)' : 'var(--text-subtle)', fontWeight: 600 }}>Stock: {stock}</span>
          </div>

          {isAtMaxStock && (
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--pastel-butter-text)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600
            }}>
              <AlertCircle size={12} /> Límite de stock disponible
            </div>
          )}
        </div>
      </div>

      {/* Controles de Cantidad */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'var(--bg-main)',
        padding: '4px 8px',
        borderRadius: 9999,
        border: '1px solid var(--border-color)'
      }}>
        <button
          onClick={handleDecrement}
          aria-label="Reducir cantidad"
          className="btn-icon"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#FFFFFF',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          <Minus size={13} strokeWidth={2.5} />
        </button>

        <span style={{
          minWidth: 28,
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '0.92rem',
          color: 'var(--text-main)'
        }}>
          {cantidad}
        </span>

        <button
          onClick={handleIncrement}
          disabled={isAtMaxStock}
          aria-label="Aumentar cantidad"
          className="btn-icon"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isAtMaxStock ? '#E8E2D9' : '#FFFFFF',
            color: isAtMaxStock ? 'var(--text-subtle)' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isAtMaxStock ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
          title={isAtMaxStock ? 'No hay más unidades en stock' : 'Agregar otra unidad'}
        >
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Subtotal por línea y botón eliminar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        justifyContent: 'flex-end',
        minWidth: 120
      }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>Subtotal</span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--text-main)'
          }}>
            ${lineTotal.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          aria-label={`Eliminar ${item.nombre} del carrito`}
          className="btn btn-danger btn-sm"
          style={{
            padding: '6px 8px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Quitar del carrito"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
