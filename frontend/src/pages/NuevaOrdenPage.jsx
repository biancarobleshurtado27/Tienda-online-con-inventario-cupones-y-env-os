import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { 
  getProductos, 
  getClientes, 
  createOrden, 
  validarCupon,
  createCliente 
} from '../services/api.js';
import AlertBox from '../components/AlertBox.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import FormField from '../components/FormField.jsx';
import { 
  ShoppingCart, 
  User, 
  Tag, 
  Truck, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const { data: productos = [], loading: loadingProds } = useFetch(getProductos);
  const { data: clientes = [], loading: loadingClientes, refetch: refetchClientes } = useFetch(getClientes);

  // Estados del formulario de orden
  const [clienteId, setClienteId] = useState('');
  const [itemsCarrito, setItemsCarrito] = useState([]); // [{ producto, cantidad }]
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null); // { codigo, porcentaje, descuento_estimado }
  const [validandoCupon, setValidandoCupon] = useState(false);

  // Estados de retroalimentación
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Modal para registrar nuevo cliente
  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', email: '', ciudad: 'San José' });
  const [guardandoCliente, setGuardandoCliente] = useState(false);

  // Cliente seleccionado actual
  const clienteSeleccionado = useMemo(() => {
    return (clientes || []).find(c => c.id === parseInt(clienteId, 10)) || null;
  }, [clientes, clienteId]);

  // Manejo de productos en el carrito
  const handleAgregarProducto = (producto) => {
    setErrorMsg(null);
    setItemsCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          setErrorMsg(`Stock máximo disponible alcanzado para "${producto.nombre}" (${producto.stock} uds).`);
          return prev;
        }
        return prev.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        if (producto.stock < 1) {
          setErrorMsg(`El producto "${producto.nombre}" está agotado.`);
          return prev;
        }
        return [...prev, { producto, cantidad: 1 }];
      }
    });
  };

  const handleModificarCantidad = (productoId, delta) => {
    setErrorMsg(null);
    setItemsCarrito(prev => {
      return prev.map(item => {
        if (item.producto.id === productoId) {
          const nuevaCant = item.cantidad + delta;
          if (nuevaCant <= 0) return null;
          if (nuevaCant > item.producto.stock) {
            setErrorMsg(`No hay suficiente inventario disponible. Stock máximo: ${item.producto.stock}`);
            return item;
          }
          return { ...item, cantidad: nuevaCant };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleEliminarItem = (productoId) => {
    setItemsCarrito(prev => prev.filter(i => i.producto.id !== productoId));
  };

  // Validar cupón con el backend
  const handleValidarCupon = async (e) => {
    e?.preventDefault();
    if (!codigoCupon.trim()) return;
    if (!clienteId) {
      setErrorMsg('Debes seleccionar un cliente antes de validar o aplicar el cupón.');
      return;
    }

    setValidandoCupon(true);
    setErrorMsg(null);
    try {
      const resultado = await validarCupon(codigoCupon.trim(), parseInt(clienteId, 10));
      setCuponAplicado(resultado.cupon);
      setSuccessMsg(`¡Cupón "${resultado.cupon.codigo}" válido! Descuento del ${resultado.cupon.porcentaje}%.`);
    } catch (err) {
      // Muestra error 409 devuelto por la API (cupón expirado, agotado o ya usado)
      setCuponAplicado(null);
      setErrorMsg(err.message || 'El cupón no es válido.');
    } finally {
      setValidandoCupon(false);
    }
  };

  const handleQuitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
  };

  // Cálculos financieros en vivo
  const subtotal = useMemo(() => {
    return itemsCarrito.reduce((acc, curr) => acc + (curr.producto.precio * curr.cantidad), 0);
  }, [itemsCarrito]);

  const descuento = useMemo(() => {
    if (!cuponAplicado) return 0;
    return parseFloat(((subtotal * cuponAplicado.porcentaje) / 100).toFixed(2));
  }, [subtotal, cuponAplicado]);

  // Regla de negocio de envío según ciudad y umbral de $50.00
  const costoEnvio = useMemo(() => {
    if (itemsCarrito.length === 0) return 0;
    const subtotalConDescuento = subtotal - descuento;
    if (subtotalConDescuento >= 50.00) return 0; // Envío gratis si supera $50.00

    if (!clienteSeleccionado) return 10.00;
    const ciudad = clienteSeleccionado.ciudad;
    const tarifas = {
      'San José': 5.00,
      'Heredia': 6.00,
      'Alajuela': 7.00,
      'Cartago': 8.00,
      'Puntarenas': 10.00,
      'Guanacaste': 12.00,
      'Limón': 12.00
    };
    return tarifas[ciudad] !== undefined ? tarifas[ciudad] : 10.00;
  }, [subtotal, descuento, itemsCarrito, clienteSeleccionado]);

  const total = useMemo(() => {
    return Math.max(0, Number((subtotal - descuento + costoEnvio).toFixed(2)));
  }, [subtotal, descuento, costoEnvio]);

  // Crear orden y enviar al backend
  const handleCrearOrden = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!clienteId) {
      setErrorMsg('Por favor selecciona un cliente para la orden.');
      return;
    }
    if (itemsCarrito.length === 0) {
      setErrorMsg('Agrega al menos un producto al carrito de compras.');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        cliente_id: parseInt(clienteId, 10),
        codigo_cupon: cuponAplicado ? cuponAplicado.codigo : null,
        items: itemsCarrito.map(i => ({
          producto_id: i.producto.id,
          cantidad: i.cantidad
        }))
      };

      const respuesta = await createOrden(payload);
      const nuevaId = respuesta?.id || respuesta?.orden?.id || 'creada';
      setSuccessMsg(`¡Orden #${nuevaId} creada exitosamente! Stock descontado de forma atómica en el inventario.`);
      setItemsCarrito([]);
      setCuponAplicado(null);
      setCodigoCupon('');

      setTimeout(() => {
        navigate('/ordenes');
      }, 1500);
    } catch (err) {
      // Muestra errores 409 (stock insuficiente / cupón inválido) o 400
      setErrorMsg(err.message || 'Error al procesar la orden en el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  // Crear nuevo cliente rápido
  const handleCrearClienteSubmit = async (e) => {
    e.preventDefault();
    setGuardandoCliente(true);
    try {
      const resp = await createCliente(nuevoCliente);
      await refetchClientes();
      const nuevoId = resp?.cliente?.id || resp?.id;
      if (nuevoId) setClienteId(String(nuevoId));
      setModalCliente(false);
      setNuevoCliente({ nombre: '', email: '', ciudad: 'San José' });
    } catch (err) {
      setErrorMsg(`Error al registrar cliente: ${err.message}`);
    } finally {
      setGuardandoCliente(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCart size={28} color="#818cf8" />
            Nueva Orden de Venta
          </h1>
          <p className="page-subtitle">
            Cálculo de envíos por ciudad, validación de inventario con transacción y cupones de descuento.
          </p>
        </div>
      </div>

      {errorMsg && <AlertBox type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />}
      {successMsg && <AlertBox type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {(loadingProds || loadingClientes) && (
        <LoadingState message="Cargando catálogo de productos y clientes..." />
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        alignItems: 'start'
      }}>
        {/* Columna Izquierda: Selección de Cliente y Catálogo de Productos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tarjeta de Selección de Cliente */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <User size={18} color="var(--primary)" />
                <span>1. Cliente de la Orden</span>
              </div>
              <button 
                type="button" 
                onClick={() => setModalCliente(true)}
                className="btn btn-outline-primary btn-sm"
              >
                <Plus size={14} /> Registrar Nuevo
              </button>
            </div>

            <select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setCuponAplicado(null); // Resetear cupón si cambia cliente
              }}
              className="select"
            >
              <option value="">-- Selecciona un cliente registrado --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.email}) · {c.ciudad}
                </option>
              ))}
            </select>

            {clienteSeleccionado && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.825rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span><strong>Destino:</strong> {clienteSeleccionado.ciudad}</span>
                <span style={{ color: 'var(--info)' }}>
                  Envío estándar: ${(costoEnvio === 0 ? '0.00 (¡Gratis!)' : costoEnvio.toFixed(2))}
                </span>
              </div>
            )}
          </div>

          {/* Selector de Productos */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14 }}>
              <ShoppingCart size={18} color="var(--primary)" />
              <span>2. Agregar Productos al Carrito</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 380,
              overflowY: 'auto',
              paddingRight: 4
            }}>
              {productos.map(p => {
                const enCarrito = itemsCarrito.find(i => i.producto.id === p.id);
                const agotado = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      opacity: agotado ? 0.6 : 1
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ${p.precio.toFixed(2)} · Stock: <strong style={{ color: p.stock > 5 ? 'var(--success)' : 'var(--warning)' }}>{p.stock}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAgregarProducto(p)}
                      disabled={agotado || (enCarrito && enCarrito.cantidad >= p.stock)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> {enCarrito ? `Añadir (${enCarrito.cantidad})` : 'Agregar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Carrito y Resumen Financiero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Carrito de Compras */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Ítems en la Orden</h3>

            {itemsCarrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <ShoppingCart size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>El carrito está vacío. Agrega productos de la lista.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {itemsCarrito.map(item => (
                  <div
                    key={item.producto.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.producto.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ${item.producto.precio.toFixed(2)} x {item.cantidad} = ${(item.producto.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleModificarCantidad(item.producto.id, -1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center', fontSize: '0.875rem' }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleModificarCantidad(item.producto.id, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => handleEliminarItem(item.producto.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', marginLeft: 6 }}
                        title="Eliminar de la orden"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Aplicación de Cupón */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: 16,
              marginBottom: 16
            }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} /> Cupón de Descuento
              </label>

              {cuponAplicado ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#34d399'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {cuponAplicado.codigo} (-{cuponAplicado.porcentaje}%)
                  </span>
                  <button
                    onClick={handleQuitarCupon}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ej. BIENVENIDO10"
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                    className="input"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={handleValidarCupon}
                    disabled={validandoCupon || !codigoCupon.trim()}
                    className="btn btn-secondary btn-sm"
                  >
                    {validandoCupon ? 'Validando...' : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>

            {/* Desglose de Totales */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'white' }}>${subtotal.toFixed(2)}</span>
              </div>

              {descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Descuento ({cuponAplicado.porcentaje}%):</span>
                  <span style={{ fontWeight: 600 }}>-${descuento.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Truck size={14} /> Envío {clienteSeleccionado ? `(${clienteSeleccionado.ciudad})` : ''}:
                </span>
                <span style={{ fontWeight: 600, color: costoEnvio === 0 ? 'var(--success)' : 'white' }}>
                  {costoEnvio === 0 ? 'GRATIS (Supera $100)' : `$${costoEnvio.toFixed(2)}`}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 10,
                marginTop: 6,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'white'
              }}>
                <span>Total a Pagar:</span>
                <span style={{ color: '#818cf8' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botón de Confirmar Orden */}
            <button
              onClick={handleCrearOrden}
              disabled={enviando || itemsCarrito.length === 0 || !clienteId}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20, padding: '14px 20px', fontSize: '1rem' }}
            >
              {enviando ? 'Procesando en Transacción...' : (
                <>
                  <span>Confirmar y Descontar Stock</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Registrar Cliente */}
      <Modal
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        title="Registrar Nuevo Cliente"
      >
        <form onSubmit={handleCrearClienteSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              required
              className="input"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              placeholder="Ej. Sofía Hernández"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              required
              className="input"
              value={nuevoCliente.email}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
              placeholder="sofia@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ciudad de Envío</label>
            <select
              className="select"
              value={nuevoCliente.ciudad}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
            >
              <option value="San José">San José (Tarifa base $3.50)</option>
              <option value="Heredia">Heredia (Tarifa $4.00)</option>
              <option value="Alajuela">Alajuela (Tarifa $4.50)</option>
              <option value="Cartago">Cartago (Tarifa $5.00)</option>
              <option value="Puntarenas">Puntarenas (Tarifa $7.00)</option>
              <option value="Limón">Limón (Tarifa $7.00)</option>
              <option value="Guanacaste">Guanacaste (Tarifa $7.00)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setModalCliente(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoCliente}
              className="btn btn-primary"
            >
              {guardandoCliente ? 'Guardando...' : 'Crear y Seleccionar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
