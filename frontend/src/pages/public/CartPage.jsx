import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { 
  getClientes, 
  createCliente, 
  validarCupon, 
  getCostoEnvio, 
  createOrden 
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
  RotateCcw
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
  const { cart, totalItems, subtotal, clearCart } = useCart();

  // Estados de Clientes
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState('');
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    ciudad: 'San José'
  });
  const [creandoCliente, setCreandoCliente] = useState(false);

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

  // Cargar clientes existentes
  useEffect(() => {
    let mounted = true;
    setLoadingClientes(true);
    getClientes()
      .then(data => {
        if (mounted && Array.isArray(data)) {
          setClientes(data);
          if (data.length > 0 && !clienteId) {
            setClienteId(String(data[0].id));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingClientes(false);
      });
    return () => { mounted = false; };
  }, []);

  // Cliente actualmente seleccionado
  const clienteSeleccionado = useMemo(() => {
    if (modoNuevoCliente) {
      return nuevoCliente;
    }
    return clientes.find(c => String(c.id) === String(clienteId)) || null;
  }, [clientes, clienteId, modoNuevoCliente, nuevoCliente]);

  // Actualizar cálculo de envío cuando cambia la ciudad del cliente o el subtotal
  useEffect(() => {
    const ciudad = clienteSeleccionado?.ciudad || 'San José';

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
        // Fallback estándar
        setCostoEnvio(ciudad === 'San José' ? 5.00 : 8.00);
      });
  }, [clienteSeleccionado?.ciudad, subtotal]);

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

  // Manejo de aplicación de cupón
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
      const cid = clienteSeleccionado && clienteSeleccionado.id ? clienteSeleccionado.id : (clientes[0]?.id || 1);
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

  // Crear cliente nuevo si está en modo registro rápido
  const handleCrearClienteRapido = async () => {
    if (!nuevoCliente.nombre.trim()) {
      throw new Error('Por favor ingresa tu nombre completo.');
    }
    if (!nuevoCliente.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCliente.email.trim())) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }

    setCreandoCliente(true);
    try {
      const creado = await createCliente({
        nombre: nuevoCliente.nombre.trim(),
        email: nuevoCliente.email.trim().toLowerCase(),
        ciudad: nuevoCliente.ciudad
      });
      setClientes(prev => [...prev, creado]);
      setClienteId(String(creado.id));
      setModoNuevoCliente(false);
      return creado.id;
    } finally {
      setCreandoCliente(false);
    }
  };

  // Confirmar y Crear Orden
  const handleConfirmarOrden = async () => {
    setErrorOrden(null);

    if (cart.length === 0) {
      setErrorOrden('Tu carrito está vacío. Agrega al menos un juguete.');
      return;
    }

    setCreandoOrden(true);

    try {
      let finalClienteId = clienteId;

      // Si está en modo nuevo cliente, registrarlo primero
      if (modoNuevoCliente) {
        finalClienteId = await handleCrearClienteRapido();
      }

      if (!finalClienteId) {
        throw new Error('Por favor selecciona o registra un cliente para la orden.');
      }

      const payload = {
        cliente_id: Number(finalClienteId),
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
          {/* PASO 1: Selección o Registro del Cliente */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14
            }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                margin: 0
              }}>
                <User size={18} color="var(--primary)" />
                <span>1. Datos del Destinatario</span>
              </h3>

              <button
                onClick={() => setModoNuevoCliente(!modoNuevoCliente)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {modoNuevoCliente ? (
                  <>
                    <User size={12} /> Seleccionar existente
                  </>
                ) : (
                  <>
                    <UserPlus size={12} /> Registrarme
                  </>
                )}
              </button>
            </div>

            {modoNuevoCliente ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Valverde"
                    value={nuevoCliente.nombre}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                    className="input"
                    style={{ fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sofia@ejemplo.com"
                    value={nuevoCliente.email}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                    className="input"
                    style={{ fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Ciudad de Entrega
                  </label>
                  <select
                    value={nuevoCliente.ciudad}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
                    className="select"
                    style={{ fontSize: '0.86rem' }}
                  >
                    {CIUDADES_COSTA_RICA.map(ciudad => (
                      <option key={ciudad} value={ciudad}>{ciudad}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                  Cliente Registrado
                </label>
                {loadingClientes ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cargando clientes...</p>
                ) : (
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="select"
                    style={{ fontSize: '0.86rem' }}
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.ciudad}) · {c.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Aviso de ciudad y costo base */}
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
              <span>Destino: <strong>{clienteSeleccionado?.ciudad || 'San José'}</strong></span>
              <span style={{ color: costoEnvio === 0 ? 'var(--pastel-mint-text)' : 'var(--text-main)', fontWeight: 700 }}>
                {costoEnvio === 0 ? '¡Envío Gratis! ($50+)' : `Envío estándar: $${costoEnvio.toFixed(2)}`}
              </span>
            </div>
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
