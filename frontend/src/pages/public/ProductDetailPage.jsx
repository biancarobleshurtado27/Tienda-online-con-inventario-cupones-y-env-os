import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductoById, getProductos } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import { getToyImageUrl, DEFAULT_TOY_IMAGE } from '../../utils/toyImages.js';
import ProductCard from '../../components/public/ProductCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  PackageCheck,
  RotateCcw
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);

  // Cantidad seleccionada en el formulario
  const [cantidad, setCantidad] = useState(1);
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);
  const [errorStock, setErrorStock] = useState(null);

  // Productos relacionados de la misma categoría
  const [relacionados, setRelacionados] = useState([]);
  const [loadingRelacionados, setLoadingRelacionados] = useState(false);

  // Carga del producto principal
  const fetchProducto = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIs404(false);
    try {
      const data = await getProductoById(id);
      setProducto(data);
      setCantidad(1);

      // Cargar productos relacionados de la misma categoría
      if (data && data.categoria) {
        setLoadingRelacionados(true);
        getProductos({ categoria: data.categoria })
          .then(list => {
            if (Array.isArray(list)) {
              setRelacionados(list.filter(p => p.id !== data.id && p.activo).slice(0, 4));
            }
          })
          .catch(() => {})
          .finally(() => setLoadingRelacionados(false));
      }
    } catch (err) {
      if (err.status === 404 || err.status === 400) {
        setIs404(true);
      } else {
        setError(err.message || 'Error al obtener los detalles del juguete.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProducto();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducto]);

  const stock = Number(producto?.stock) || 0;
  const precio = Number(producto?.precio) || 0;
  const agotado = stock <= 0;
  const enCarrito = producto ? getItemQuantity(producto.id) : 0;
  const maxDisponible = Math.max(0, stock - enCarrito);

  const handleIncrement = () => {
    if (cantidad < stock) {
      setCantidad(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (agotado || !producto) return;
    const res = addToCart(producto, cantidad);
    if (res.success) {
      setAgregadoFeedback(true);
      setErrorStock(null);
      setTimeout(() => setAgregadoFeedback(false), 2000);
    } else {
      setErrorStock(res.message);
    }
  };

  const handleBuyNow = () => {
    if (agotado || !producto) return;
    addToCart(producto, cantidad);
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <LoadingState message="Buscando la magia de este juguete..." />
      </div>
    );
  }

  if (is404) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <EmptyState
          title="Juguete no encontrado"
          description={`El juguete con ID #${id} no existe en nuestro catálogo o ha sido retirado del taller.`}
          actionText="Volver al Catálogo de Juguetes"
          actionTo="/catalogo"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <ErrorState
          title="No se pudo cargar el juguete"
          message={error}
          onRetry={fetchProducto}
          showHome={true}
        />
      </div>
    );
  }

  if (!producto) return null;

  return (
    <div className="container fade-in" style={{ paddingTop: 28, paddingBottom: 64 }}>
      {/* Botón de Retorno y Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24
      }}>
        <Link
          to="/catalogo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 9999,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Volver al Catálogo</span>
        </Link>

        {/* Migas de pan sutiles */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <Link to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {producto.categoria}
          </Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{producto.nombre}</span>
        </div>
      </div>

      {/* Tarjeta Principal del Producto */}
      <div className="card" style={{
        padding: '36px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 40,
        marginBottom: 56,
        alignItems: 'start'
      }}>
        {/* Columna Izquierda: Fotografía Grande */}
        <div>
          <div style={{
            width: '100%',
            height: 420,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#F5EFE6',
            position: 'relative',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <img
              src={getToyImageUrl(producto)}
              alt={producto.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_TOY_IMAGE;
              }}
            />

            {/* Categoría Flotante */}
            <span style={{
              position: 'absolute',
              top: 16,
              left: 16,
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: 9999,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--pastel-lavender-text)',
              border: '1px solid rgba(142, 116, 190, 0.25)',
              boxShadow: '0 2px 8px rgba(47, 38, 54, 0.08)',
              backdropFilter: 'blur(4px)'
            }}>
              {producto.categoria}
            </span>
          </div>

          {/* Garantías bajo la imagen */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            marginTop: 20
          }}>
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <Truck size={18} color="var(--pastel-lavender)" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)' }}>Envío Seguro</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A toda la ciudad</div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <ShieldCheck size={18} color="var(--pastel-mint)" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)' }}>100% Original</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Materiales seguros</div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <Sparkles size={18} color="var(--pastel-butter)" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)' }}>Juego Consciente</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimula creatividad</div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Información y Formulario de Compra */}
        <div>
          {/* Disponibilidad */}
          <div style={{ marginBottom: 12 }}>
            {agotado ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--pastel-rose-text)',
                backgroundColor: 'var(--pastel-rose-light)',
                padding: '4px 12px',
                borderRadius: 9999,
                border: '1px solid var(--pastel-rose-border)'
              }}>
                <AlertCircle size={14} /> Juguete Agotado Temporalmente
              </span>
            ) : stock <= 5 ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--pastel-butter-text)',
                backgroundColor: 'var(--pastel-butter-light)',
                padding: '4px 12px',
                borderRadius: 9999,
                border: '1px solid var(--pastel-butter-border)'
              }}>
                <AlertCircle size={14} /> ¡Últimas {stock} unidades disponibles en el taller!
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--pastel-mint-text)',
                backgroundColor: 'var(--pastel-mint-light)',
                padding: '4px 12px',
                borderRadius: 9999,
                border: '1px solid var(--pastel-mint-border)'
              }}>
                <PackageCheck size={14} /> En Stock ({stock} unidades listas para enviar)
              </span>
            )}
          </div>

          {/* Título */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.25,
            marginBottom: 16
          }}>
            {producto.nombre}
          </h1>

          {/* Precio */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: '1px solid var(--border-color)'
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1
            }}>
              ${precio.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              IVA incluido · Tarifa de envío calculada en carrito
            </span>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: 8
            }}>
              Descripción del Juguete
            </h3>
            <p style={{
              fontSize: '0.94rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              margin: 0
            }}>
              {producto.descripcion || 'Este hermoso juguete ha sido cuidadosamente elaborado para acompañar el desarrollo infantil, promoviendo el juego libre, la cooperación y la fantasía.'}
            </p>
          </div>

          {/* Selector de Cantidad y Botones de Compra */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            {/* Control de cantidad */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Cantidad a pedir:
              </span>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 9999,
                border: '1px solid var(--border-color)'
              }}>
                <button
                  onClick={handleDecrement}
                  disabled={cantidad <= 1 || agotado}
                  aria-label="Disminuir cantidad"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: cantidad <= 1 || agotado ? 'not-allowed' : 'pointer',
                    opacity: cantidad <= 1 || agotado ? 0.4 : 1
                  }}
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>

                <span style={{
                  minWidth: 32,
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: 'var(--text-main)'
                }}>
                  {cantidad}
                </span>

                <button
                  onClick={handleIncrement}
                  disabled={cantidad >= stock || agotado}
                  aria-label="Aumentar cantidad"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: cantidad >= stock || agotado ? 'not-allowed' : 'pointer',
                    opacity: cantidad >= stock || agotado ? 0.4 : 1
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Aviso si ya tiene en el carrito */}
            {enCarrito > 0 && (
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--pastel-lavender-text)',
                backgroundColor: 'var(--pastel-lavender-light)',
                padding: '6px 12px',
                borderRadius: 8,
                marginBottom: 16,
                fontWeight: 600
              }}>
                Ya tienes <strong>{enCarrito}</strong> unidades en tu carrito (quedan {maxDisponible} disponibles).
              </div>
            )}

            {/* Error de stock */}
            {errorStock && (
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--danger)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <AlertCircle size={15} /> {errorStock}
              </div>
            )}

            {/* Botones de Acción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleAddToCart}
                disabled={agotado || (enCarrito >= stock)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: agregadoFeedback ? 'var(--pastel-mint)' : undefined,
                  borderColor: agregadoFeedback ? 'var(--pastel-mint)' : undefined,
                  boxShadow: '0 4px 14px rgba(142, 116, 190, 0.25)'
                }}
              >
                {agregadoFeedback ? (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    <span>¡Agregado al Carrito Mágico!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} strokeWidth={2.2} />
                    <span>{agotado ? 'Juguete Agotado' : 'Añadir al Carrito'}</span>
                  </>
                )}
              </button>

              {!agotado && (
                <button
                  onClick={handleBuyNow}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.94rem',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  Comprar Ahora y Ver Resumen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PRODUCTOS RELACIONADOS DE LA MISMA CATEGORÍA
          ======================================================== */}
      {relacionados.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0
              }}>
                Otros Juguetes de {producto.categoria}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Recomendaciones similares que también despiertan sonrisas
              </p>
            </div>

            <Link
              to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`}
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              Ver más de {producto.categoria} →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20
          }}>
            {relacionados.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
