import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getOrdenes, getOrdenById } from '../../services/api.js';
import { 
  User, 
  Package, 
  MapPin, 
  Mail, 
  LogOut, 
  ExternalLink, 
  Loader2, 
  Calendar, 
  CreditCard,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  X,
  Tag
} from 'lucide-react';

const ESTADOS_BADGES = {
  nueva: { label: 'Nueva', bg: 'var(--pastel-blue-light)', text: '#2563EB', border: 'rgba(59, 130, 246, 0.25)' },
  pagada: { label: 'Pagada', bg: '#ECFDF5', text: '#059669', border: 'rgba(16, 185, 129, 0.25)' },
  enviada: { label: 'En camino', bg: 'var(--pastel-lavender-light)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.25)' },
  entregada: { label: 'Entregada', bg: 'var(--pastel-mint-light)', text: '#047857', border: 'rgba(5, 150, 105, 0.25)' },
  cancelada: { label: 'Cancelada', bg: '#FFF1F2', text: '#E11D48', border: 'rgba(225, 29, 72, 0.25)' }
};

export default function MyAccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal para ver detalle de una orden
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    setLoading(true);
    setError(null);
    try {
      // El backend filtra automáticamente por el cliente_id de la sesión del usuario
      const data = await getOrdenes();
      setOrdenes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar tus órdenes.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (ordenId) => {
    setLoadingDetail(true);
    try {
      const data = await getOrdenById(ordenId);
      setSelectedOrden(data);
    } catch (err) {
      alert(err.message || 'Error al obtener los detalles del pedido.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/iniciar-sesion');
  };

  return (
    <div style={{
      minHeight: '80vh',
      padding: '40px 20px',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Cabecera del Perfil del Cliente */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 32px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(47, 38, 54, 0.04)',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-rose-light)',
              color: 'var(--pastel-rose-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(222, 123, 148, 0.25)',
              border: '2px solid #FFFFFF'
            }}>
              <User size={28} strokeWidth={2.2} />
            </div>

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--pastel-rose-light)',
                color: 'var(--pastel-rose-text)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: 9999,
                marginBottom: 4,
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={11} />
                <span>CUENTA DE CLIENTE</span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.2
              }}>
                Hola, {user?.nombre || 'Cliente'}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 6,
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={14} />
                  {user?.email}
                </span>
                {user?.ciudad && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={14} />
                    {user?.ciudad}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 9999,
                backgroundColor: 'var(--pastel-rose-light)',
                color: 'var(--pastel-rose-text)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingBag size={15} />
              <span>Explorar juguetes</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 9999,
                backgroundColor: '#FAF7F2',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={15} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Sección: Mis Órdenes */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 32px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(47, 38, 54, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={20} color="var(--primary)" strokeWidth={2.3} />
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0
              }}>
                Mis órdenes ({ordenes.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div style={{
              padding: '60px 0',
              textAlign: 'center',
              color: 'var(--text-subtle)'
            }}>
              <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px' }} color="var(--pastel-lavender)" />
              <p style={{ fontSize: '0.9rem' }}>Cargando tus órdenes...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: '20px',
              backgroundColor: '#FFF1F2',
              color: '#BE123C',
              borderRadius: 14,
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          ) : ordenes.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              backgroundColor: '#FAF7F2',
              borderRadius: 18,
              border: '1px dashed var(--border-color)'
            }}>
              <ShoppingBag size={40} strokeWidth={1.8} color="var(--text-subtle)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 6
              }}>
                Aún no tienes órdenes registradas
              </h3>
              <p style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                maxWidth: 420,
                margin: '0 auto 20px'
              }}>
                Explora nuestro catálogo de juguetes y llena tu hogar de alegría e imaginación.
              </p>
              <Link
                to="/catalogo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 22px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(222, 123, 148, 0.3)'
                }}
              >
                <span>Ir al catálogo</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ordenes.map((orden) => {
                const badge = ESTADOS_BADGES[orden.estado] || {
                  label: orden.estado,
                  bg: '#FAF7F2',
                  text: 'var(--text-main)',
                  border: 'var(--border-color)'
                };

                return (
                  <div
                    key={orden.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: '#FAF7F2',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)',
                        fontWeight: 800,
                        fontSize: '0.88rem'
                      }}>
                        #{orden.id}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}>
                            {badge.label}
                          </span>

                          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} />
                            {new Date(orden.creado_en).toLocaleDateString('es-CR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {orden.total_items ? `${orden.total_items} juguetes en la orden` : 'Detalle de compra'}
                          {orden.cupon_codigo && ` · Cupón: ${orden.cupon_codigo}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                          Total pagado
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: 'var(--text-main)'
                        }}>
                          ${Number(orden.total).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerDetalle(orden.id)}
                        disabled={loadingDetail}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '9px 16px',
                          borderRadius: 9999,
                          backgroundColor: '#FAF7F2',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FAF7F2'; }}
                      >
                        <ExternalLink size={14} />
                        <span>Ver detalle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Detalle de Orden */}
        {selectedOrden && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(47, 38, 54, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              maxWidth: 580,
              width: '100%',
              padding: 28,
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(47, 38, 54, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={22} color="var(--primary)" />
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-main)'
                  }}>
                    Detalle de Orden #{selectedOrden.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrden(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Información general */}
              <div style={{
                backgroundColor: '#FAF7F2',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 20,
                fontSize: '0.84rem',
                lineHeight: 1.6,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8
              }}>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Estado:</span>
                  <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{selectedOrden.estado}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Fecha:</span>
                  <strong style={{ color: 'var(--text-main)' }}>
                    {new Date(selectedOrden.creado_en).toLocaleString('es-CR')}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Destino de entrega:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedOrden.cliente_ciudad || user?.ciudad}</strong>
                </div>
                {selectedOrden.cupon_codigo && (
                  <div>
                    <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Cupón aplicado:</span>
                    <strong style={{ color: 'var(--primary)' }}>{selectedOrden.cupon_codigo} ({selectedOrden.cupon_porcentaje}%)</strong>
                  </div>
                )}
              </div>

              {/* Items */}
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                Juguetes comprados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {selectedOrden.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid var(--border-color)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                        {item.producto_nombre}
                      </strong>
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                        Cantidad: {item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      ${(item.cantidad * item.precio_unitario).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desglose financiero */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: '0.86rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>${Number(selectedOrden.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrden.descuento) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Descuento cupón:</span>
                    <span>-${Number(selectedOrden.descuento).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Envío:</span>
                  <span>{Number(selectedOrden.envio) === 0 ? 'Gratis' : `$${Number(selectedOrden.envio).toFixed(2)}`}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: '1px dashed var(--border-color)'
                }}>
                  <span>Total:</span>
                  <span>${Number(selectedOrden.total).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrden(null)}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '11px',
                  backgroundColor: '#FAF7F2',
                  border: '1px solid var(--border-color)',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
