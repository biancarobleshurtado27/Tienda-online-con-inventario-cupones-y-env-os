import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  validarCupon, 
  getCostoEnvio, 
  createOrden,
  recomendarCarritoIA 
} from '../../services/api.js';
import CartItem from '../../components/public/CartItem.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AlertBox from '../../components/AlertBox.jsx';
import { 
  ShoppingBag, 
  User, 
  UserPlus, 
  Tag, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Store, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  LogIn,
  Bot,
  Plus
} from 'lucide-react';

const CIUDADES_COSTA_RICA = [
  'San José',
  'Heredia',
  'Alajuela',
  'Cartago',
  'Puntarenas',
  'Guanacaste',
  'Limón'
];

export default function CartPage() {
  const { cart, totalItems, subtotal, clearCart, addToCart } = useCart();
  const { user, isAuthenticated, isCustomer, isStaff } = useAuth();
  const navigate = useNavigate();

  // Ciudad de entrega (por defecto la del perfil del cliente autenticado o San José)
  const [ciudadEntrega, setCiudadEntrega] = useState(user?.ciudad || 'San José');

  // Actualizar si el usuario cambia o carga
  useEffect(() => {
    if (user?.ciudad) {
      setCiudadEntrega(user.ciudad);
    }
  }, [user]);

  // Estados de Cupón
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null); // { codigo, porcentaje, descuento }
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState(null);
  const [successCupon, setSuccessCupon] = useState(null);

  // Estados de Envío y Totales
  const [costoEnvio, setCostoEnvio] = useState(5.00);

  // Estados de Orden
  const [creandoOrden, setCreandoOrden] = useState(false);
  const [errorOrden, setErrorOrden] = useState(null);
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Estados del recomendador de IA (n8n)
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargandoRecom, setCargandoRecom] = useState(false);
  const [errorRecom, setErrorRecom] = useState(null);
  const [recomConsultadas, setRecomConsultadas] = useState(false);

  // Solicitar sugerencias de IA basadas en los productos del carrito
  const handleSolicitarRecomendaciones = async () => {
    if (cart.length === 0) return;
    setCargandoRecom(true);
    setErrorRecom(null);
    setRecomConsultadas(true);
    try {
      const ids = cart.map(item => Number(item.id));
      const resp = await recomendarCarritoIA(ids);
      if (resp?.ok && Array.isArray(resp?.data?.recomendaciones)) {
        setRecomendaciones(resp.data.recomendaciones);
      } else {
        setErrorRecom(resp?.error || 'No se pudieron obtener sugerencias de n8n en este momento.');
      }
    } catch (err) {
      setErrorRecom(`Error al consultar agente de IA: ${err.message}`);
    } finally {
      setCargandoRecom(false);
    }
  };

  const handleAgregarRecomendado = (rec) => {
    addToCart({
      id: rec.id,
      nombre: rec.nombre,
      precio: rec.precio,
      stock: rec.stock || 10,
      categoria: rec.categoria
    }, 1);
  };

  // Actualizar cálculo de envío cuando cambia la ciudad o el subtotal
  useEffect(() => {
    const ciudad = ciudadEntrega || 'San José';

    // Regla de envío gratis para compras de $50 o más
    if (subtotal >= 50.00) {
      setCostoEnvio(0.00);
      return;
    }

    getCostoEnvio(ciudad)
      .then(res => {
        if (res && typeof res.costo_envio === 'number') {
          setCostoEnvio(res.costo_envio);
        }
      })
      .catch(() => {
        setCostoEnvio(ciudad === 'San José' ? 5.00 : 8.00);
      });
  }, [ciudadEntrega, subtotal]);

  // Descuento estimado del cupón
  const montoDescuento = useMemo(() => {
    if (!cuponAplicado || !cuponAplicado.porcentaje) return 0;
    return (subtotal * cuponAplicado.porcentaje) / 100;
  }, [subtotal, cuponAplicado]);

  // Total final de la orden
  const totalPagar = useMemo(() => {
    const conDescuento = Math.max(0, subtotal - montoDescuento);
    return conDescuento + costoEnvio;
  }, [subtotal, montoDescuento, costoEnvio]);

  const handleAplicarCupon = async (e) => {
    e.preventDefault();
    if (!codigoCupon.trim()) {
      setErrorCupon('Ingresa un código de cupón (Ej. BIENVENIDA10)');
      return;
    }

    setValidandoCupon(true);
    setErrorCupon(null);
    setSuccessCupon(null);

    try {
      const cid = user?.cliente_id || 1;
      const res = await validarCupon(codigoCupon.trim(), cid, subtotal);

      if (res && res.valido && res.cupon) {
        setCuponAplicado({
          codigo: res.cupon.codigo,
          porcentaje: res.cupon.porcentaje,
          descuento: res.descuento_estimado || ((subtotal * res.cupon.porcentaje) / 100)
        });
        setSuccessCupon(`¡Cupón ${res.cupon.codigo} aplicado! Ahorras un ${res.cupon.porcentaje}%.`);
      } else {
        setCuponAplicado(null);
        setErrorCupon(res.mensaje || 'Cupón no válido para esta orden.');
      }
    } catch (err) {
      setCuponAplicado(null);
      setErrorCupon(err.message || 'Error al validar el cupón.');
    } finally {
      setValidandoCupon(false);
    }
  };

  const handleRemoverCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setSuccessCupon(null);
    setErrorCupon(null);
  };

  // Confirmar y Crear Orden
  const handleConfirmarOrden = async () => {
    setErrorOrden(null);

    if (cart.length === 0) {
      setErrorOrden('Tu carrito está vacío. Agrega al menos un juguete.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/iniciar-sesion?redirect=/carrito');
      return;
    }

    if (isStaff) {
      setErrorOrden('El personal de tienda no puede realizar compras desde el carrito de clientes.');
      return;
    }

    setCreandoOrden(true);

    try {
      const payload = {
        items: cart.map(item => ({
          producto_id: Number(item.id),
          cantidad: Number(item.cantidad)
        })),
        codigo_cupon: cuponAplicado ? cuponAplicado.codigo : undefined
      };

      const ordenRes = await createOrden(payload);

      // Limpiar carrito tras éxito
      clearCart();
      setOrdenCreada(ordenRes);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorOrden(err.message || 'Error al procesar la orden con el servidor.');
    } finally {
      setCreandoOrden(false);
    }
  };

  // ========================================================
  // PANTALLA DE ÉXITO TRAS CREAR LA ORDEN
  // ========================================================
  if (ordenCreada) {
    return (
      <div className="container fade-in" style={{ padding: '60px 0', maxWidth: 680 }}>
        <div className="card" style={{
          padding: '44px 32px',
          textAlign: 'center',
          borderTop: '6px solid var(--pastel-mint)',
          boxShadow: '0 16px 36px rgba(120, 95, 130, 0.08)'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-mint-light)',
            color: 'var(--pastel-mint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 16px rgba(65, 160, 125, 0.2)'
          }}>
            <CheckCircle2 size={42} strokeWidth={2.4} />
          </div>

          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--pastel-mint-text)',
            backgroundColor: 'var(--pastel-mint-light)',
            padding: '4px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12
          }}>
            ¡Orden Confirmada con Éxito!
          </span>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: 10
          }}>
            Orden #{ordenCreada.id} Registrada
          </h1>

          <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 28px' }}>
            Gracias por confiar en <strong>Mundo Juguete</strong>. Nuestro taller ya está preparando tu paquete con cariño y cuidado artesanal.
          </p>

          {/* Resumen de la Orden Creada */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            border: '1px solid var(--border-color)',
            textAlign: 'left',
            marginBottom: 32,
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Destinatario:</span>
              <strong>{ordenCreada.cliente?.nombre || clienteSeleccionado?.nombre || 'Cliente'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Ciudad de Entrega:</span>
              <strong>{ordenCreada.cliente?.ciudad || clienteSeleccionado?.ciudad || 'Costa Rica'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Estado Inicial:</span>
              <span style={{ color: 'var(--pastel-lavender-text)', fontWeight: 800, textTransform: 'capitalize' }}>
                {ordenCreada.estado || 'Nueva'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 12,
              marginTop: 10,
              borderTop: '1px solid var(--border-color)',
              fontSize: '1.05rem',
              fontWeight: 800
            }}>
              <span>Total Pagado:</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                ${(ordenCreada.total || totalPagar).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link
              to="/catalogo"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                textDecoration: 'none'
              }}
            >
              <Store size={18} strokeWidth={2.2} />
              <span>Seguir Explorando el Catálogo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // PANTALLA CUANDO EL CARRITO ESTÁ VACÍO
  // ========================================================
  if (cart.length === 0) {
    return (
      <div className="container fade-in" style={{ padding: '60px 0' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Tu Carrito Mágico está vacío"
          description="Aún no has agregado juguetes a tu carrito. ¡Explora nuestro catálogo y descubre mundos llenos de imaginación!"
          actionText="Explorar Catálogo de Juguetes"
          actionTo="/catalogo"
        />
      </div>
    );
  }

  // ========================================================
  // CARRITO CON ARTÍCULOS Y PROCESO DE ORDEN
  // ========================================================
  return (
    <div className="container fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Encabezado del Carrito */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: 6
        }}>
          Carrito Mágico de Compras
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Revisa tus juguetes seleccionados, selecciona el destino y confirma tu orden sin intermediarios.
        </p>
      </div>

      {errorOrden && (
        <AlertBox type="error" message={errorOrden} onClose={() => setErrorOrden(null)} />
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start'
      }}>
        {/* Columna Izquierda: Lista de Juguetes en el Carrito */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: 0
            }}>
              Juguetes en tu Orden ({totalItems})
            </h2>

            <button
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--pastel-berry)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={13} /> Vaciar carrito
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cart.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Recomendaciones Mágicas con IA (n8n) */}
          <div style={{
            marginTop: 20,
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 14px rgba(142, 116, 190, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 12
            }}>
              <div>
                <span style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Sparkles size={16} color="var(--pastel-lavender)" /> Sugerencias de IA para tu Carrito
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sugerencias automáticas del agente n8n basadas en los juguetes que tienes en tu orden.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSolicitarRecomendaciones}
                disabled={cargandoRecom}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  padding: '6px 12px'
                }}
              >
                <Bot size={14} color="var(--primary)" />
                {cargandoRecom ? 'Consultando n8n...' : 'Pedir recomendaciones a la IA'}
              </button>
            </div>

            {errorRecom && (
              <AlertBox type="error" message={errorRecom} onClose={() => setErrorRecom(null)} />
            )}

            {recomendaciones.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, marginTop: 12 }}>
                {recomendaciones.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--pastel-lavender-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {rec.categoria}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 2 }}>
                        {rec.nombre}
                      </div>
                      {rec.motivo && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 8px 0', fontStyle: 'italic' }}>
                          "{rec.motivo}"
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>
                        ${Number(rec.precio).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAgregarRecomendado(rec)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title="Agregar al carrito"
                      >
                        <Plus size={12} /> Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              ← Continuar explorando más juguetes
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Cliente, Cupón y Resumen Financiero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* PASO 1: Datos del Destinatario según Autenticación */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              margin: '0 0 14px 0'
            }}>
              <User size={18} color="var(--primary)" />
              <span>1. Cuenta y Destino</span>
            </h3>

            {!isAuthenticated ? (
              <div style={{
                backgroundColor: '#FAF7F2',
                borderRadius: 14,
                padding: '16px',
                border: '1px dashed var(--border-color)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  marginBottom: 12
                }}>
                  Para confirmar tu pedido debes iniciar sesión o registrarte como cliente.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link
                    to="/iniciar-sesion?redirect=/carrito"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 9999,
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <LogIn size={14} />
                    <span>Iniciar sesión</span>
                  </Link>

                  <Link
                    to="/registro"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 9999,
                      backgroundColor: '#FFFFFF',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <UserPlus size={14} />
                    <span>Crear cuenta</span>
                  </Link>
                </div>
              </div>
            ) : isStaff ? (
              <div style={{
                backgroundColor: '#FFF1F2',
                border: '1px solid #FFE4E6',
                borderRadius: 14,
                padding: '14px',
                color: '#BE123C',
                fontSize: '0.84rem',
                lineHeight: 1.45
              }}>
                <strong>Sesión de Personal de Tienda:</strong> Por políticas de seguridad, las cuentas del personal no pueden comprar juguetes desde el carrito público.
                <div style={{ marginTop: 10 }}>
                  <Link
                    to="/admin"
                    style={{
                      display: 'inline-block',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      textDecoration: 'underline'
                    }}
                  >
                    Ir al Panel de Administración →
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  backgroundColor: '#FAF7F2',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 14,
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.nombre}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.email}</div>
                  <div style={{ color: 'var(--pastel-lavender-text)', fontSize: '0.76rem', fontWeight: 700, marginTop: 4 }}>
                    Cuenta de cliente verificada (ID #{user.cliente_id})
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Ciudad de Destino (para cálculo de envío)
                  </label>
                  <select
                    value={ciudadEntrega}
                    onChange={(e) => setCiudadEntrega(e.target.value)}
                    className="select"
                    style={{ fontSize: '0.86rem', width: '100%' }}
                  >
                    {CIUDADES_COSTA_RICA.map(ciudad => (
                      <option key={ciudad} value={ciudad}>{ciudad}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-main)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Destino: <strong>{ciudadEntrega}</strong></span>
                  <span style={{ color: costoEnvio === 0 ? 'var(--pastel-mint-text)' : 'var(--text-main)', fontWeight: 700 }}>
                    {costoEnvio === 0 ? 'Envío Gratis ($50+)' : `Tarifa de envío: $${costoEnvio.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: Aplicación de Cupón */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12
            }}>
              <Tag size={18} color="var(--pastel-rose)" />
              <span>2. Cupón de Descuento</span>
            </h3>

            {cuponAplicado ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                backgroundColor: 'var(--pastel-mint-light)',
                border: '1px solid var(--pastel-mint-border)'
              }}>
                <div>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: 'var(--pastel-mint-text)'
                  }}>
                    Cupón {cuponAplicado.codigo}
                  </span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {cuponAplicado.porcentaje}% de descuento (-${montoDescuento.toFixed(2)})
                  </div>
                </div>

                <button
                  onClick={handleRemoverCupon}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--pastel-berry)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <form onSubmit={handleAplicarCupon} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Ej. BIENVENIDA10"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                  className="input"
                  style={{ fontSize: '0.86rem', textTransform: 'uppercase' }}
                />
                <button
                  type="submit"
                  disabled={validandoCupon}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}
                >
                  {validandoCupon ? 'Validando...' : 'Aplicar'}
                </button>
              </form>
            )}

            {errorCupon && (
              <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={13} /> {errorCupon}
              </div>
            )}
            {successCupon && (
              <div style={{ fontSize: '0.78rem', color: 'var(--pastel-mint-text)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> {successCupon}
              </div>
            )}
          </div>

          {/* PASO 3: Resumen Financiero y Confirmación */}
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: 16
            }}>
              Resumen de Compra
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({totalItems} artículos):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {cuponAplicado && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pastel-mint-text)', fontWeight: 700 }}>
                  <span>Descuento cupón ({cuponAplicado.porcentaje}%):</span>
                  <span>-${montoDescuento.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Costo de Envío:</span>
                <span>
                  {costoEnvio === 0 ? (
                    <strong style={{ color: 'var(--pastel-mint-text)' }}>Gratis</strong>
                  ) : (
                    `$${costoEnvio.toFixed(2)}`
                  )}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 14,
                borderTop: '2px dashed var(--border-color)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)'
              }}>
                <span>Total a Pagar:</span>
                <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1.45rem' }}>
                  ${totalPagar.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón de Confirmación Real */}
            <button
              onClick={handleConfirmarOrden}
              disabled={creandoOrden || cart.length === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.02rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 6px 18px rgba(142, 116, 190, 0.3)'
              }}
            >
              {creandoOrden ? (
                <span>Creando tu orden en el taller...</span>
              ) : (
                <>
                  <Sparkles size={18} strokeWidth={2.3} />
                  <span>Confirmar y Crear Orden Mágica</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 14,
              fontSize: '0.74rem',
              color: 'var(--text-subtle)'
            }}>
              <ShieldCheck size={14} color="var(--pastel-mint)" />
              <span>Transacción real segura · Descuento de stock en base de datos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
