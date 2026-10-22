import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { 
  getOrdenes, 
  getOrdenById, 
  updateEstadoOrden, 
  cancelarOrden 
} from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import AlertBox from '../components/AlertBox.jsx';
import Modal from '../components/Modal.jsx';
import { 
  ClipboardList, 
  Filter, 
  Eye, 
  XCircle, 
  CheckCircle, 
  Truck, 
  PackageCheck,
  User,
  Calendar,
  DollarSign,
  RotateCcw
} from 'lucide-react';

const ESTADOS_FILTRO = ['Todos', 'nueva', 'pagada', 'enviada', 'entregada', 'cancelada'];

export default function OrdenesPage() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const { data: ordenes = [], loading, error, refetch } = useFetch(
    () => getOrdenes(filtroEstado !== 'Todos' ? { estado: filtroEstado } : {}),
    [filtroEstado]
  );

  // Detalle de orden seleccionada
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Feedback de acciones
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  // Ver detalle con llamada a GET /api/ordenes/:id
  const handleVerDetalle = async (id) => {
    setLoadingDetalle(true);
    setActionError(null);
    try {
      const detalle = await getOrdenById(id);
      setOrdenDetalle(detalle);
      setModalDetalleAbierto(true);
    } catch (err) {
      setActionError(`Error al obtener detalle: ${err.message}`);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Cambiar estado en el flujo permitido (nueva -> pagada -> enviada -> entregada)
  const handleAvanzarEstado = async (orden, proximoEstado) => {
    setProcesandoId(orden.id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateEstadoOrden(orden.id, proximoEstado);
      setActionSuccess(`Orden #${orden.id} actualizada al estado "${proximoEstado}".`);
      refetch();
      if (ordenDetalle && ordenDetalle.id === orden.id) {
        setOrdenDetalle({ ...ordenDetalle, estado: proximoEstado });
      }
    } catch (err) {
      // Muestra error 409 si el cambio de estado es inválido
      setActionError(err.message || 'Error al actualizar estado.');
    } finally {
      setProcesandoId(null);
    }
  };

  // Cancelar orden (desencadena reposición de stock en el backend con transacción)
  const handleCancelarOrden = async (orden) => {
    if (!window.confirm(`¿Confirmas la cancelación de la Orden #${orden.id}? Los productos reservados serán devueltos al inventario.`)) {
      return;
    }

    setProcesandoId(orden.id);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await cancelarOrden(orden.id);
      setActionSuccess(res.mensaje || `Orden #${orden.id} cancelada. Inventario repuesto correctamente.`);
      refetch();
      if (ordenDetalle && ordenDetalle.id === orden.id) {
        setOrdenDetalle({ ...ordenDetalle, estado: 'cancelada' });
      }
    } catch (err) {
      // Captura y despliega error 409 (regla de negocio: no se puede cancelar si ya fue enviada o entregada)
      setActionError(err.message || 'No se puede cancelar esta orden.');
    } finally {
      setProcesandoId(null);
    }
  };

  // Determinar siguiente paso del flujo
  const getSiguienteEstado = (estado) => {
    if (estado === 'nueva') return 'pagada';
    if (estado === 'pagada') return 'enviada';
    if (estado === 'enviada') return 'entregada';
    return null;
  };

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardList size={28} color="#818cf8" />
            Gestión de Órdenes
          </h1>
          <p className="page-subtitle">
            Flujo de estados (nueva → pagada → enviada → entregada), detalle relacional y cancelación con reposición de inventario.
          </p>
        </div>
      </div>

      {actionError && <AlertBox type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <AlertBox type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}
      {error && <AlertBox type="error" message={error} />}

      {/* Filtro por estado */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Filter size={18} color="var(--text-muted)" />
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por estado:</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ESTADOS_FILTRO.map(est => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className="btn btn-sm"
              style={{
                backgroundColor: filtroEstado === est ? 'var(--primary-light)' : 'var(--bg-subtle)',
                color: filtroEstado === est ? '#818cf8' : 'var(--text-muted)',
                borderColor: filtroEstado === est ? 'var(--primary)' : 'var(--border-color)',
                textTransform: 'capitalize'
              }}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla / Lista de Órdenes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Cargando listado de órdenes...
        </div>
      ) : ordenes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <h3>No se encontraron órdenes</h3>
          <p style={{ marginTop: 6, fontSize: '0.9rem' }}>No hay registros que coincidan con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Fecha</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Cliente</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Ciudad</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Total</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(orden => {
                  const siguiente = getSiguienteEstado(orden.estado);
                  const sePuedeCancelar = orden.estado === 'nueva' || orden.estado === 'pagada';
                  const isProcessing = procesandoId === orden.id;

                  return (
                    <tr 
                      key={orden.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 800 }}>#{orden.id}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {orden.fecha ? new Date(orden.fecha).toLocaleDateString('es-CR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{orden.cliente_nombre || `Cliente #${orden.cliente_id}`}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{orden.cliente_ciudad || '-'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: 'white' }}>${orden.total.toFixed(2)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge estado={orden.estado} />
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleVerDetalle(orden.id)}
                            className="btn btn-secondary btn-sm"
                            title="Ver detalle completo"
                          >
                            <Eye size={14} /> Detalle
                          </button>

                          {siguiente && (
                            <button
                              onClick={() => handleAvanzarEstado(orden, siguiente)}
                              disabled={isProcessing}
                              className="btn btn-primary btn-sm"
                              title={`Avanzar a ${siguiente}`}
                            >
                              {siguiente === 'pagada' && <CheckCircle size={14} />}
                              {siguiente === 'enviada' && <Truck size={14} />}
                              {siguiente === 'entregada' && <PackageCheck size={14} />}
                              A {siguiente}
                            </button>
                          )}

                          {sePuedeCancelar && (
                            <button
                              onClick={() => handleCancelarOrden(orden)}
                              disabled={isProcessing}
                              className="btn btn-danger btn-sm"
                              title="Cancelar orden y reponer inventario"
                            >
                              <XCircle size={14} /> Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Orden (GET /:id con datos relacionados) */}
      <Modal
        isOpen={modalDetalleAbierto}
        onClose={() => setModalDetalleAbierto(false)}
        title={ordenDetalle ? `Detalle de la Orden #${ordenDetalle.id}` : 'Cargando...'}
      >
        {ordenDetalle && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-subtle)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado actual:</div>
                <div style={{ marginTop: 4 }}>
                  <StatusBadge estado={ordenDetalle.estado} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha:</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ordenDetalle.fecha}</div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} /> Cliente & Destino
              </h4>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                <p><strong>Nombre:</strong> {ordenDetalle.cliente?.nombre}</p>
                <p><strong>Email:</strong> {ordenDetalle.cliente?.email}</p>
                <p><strong>Ciudad de entrega:</strong> {ordenDetalle.cliente?.ciudad}</p>
                {ordenDetalle.cupon && (
                  <p style={{ color: 'var(--success)', marginTop: 4 }}>
                    <strong>Cupón aplicado:</strong> {ordenDetalle.cupon.codigo} (-{ordenDetalle.cupon.porcentaje}%)
                  </p>
                )}
              </div>
            </div>

            {/* Productos relacionados (orden_items) */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Artículos Comprados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(ordenDetalle.items || []).map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.producto_nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ${item.precio_unitario.toFixed(2)} x {item.cantidad} unidades
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'white' }}>
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de totales */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>${ordenDetalle.subtotal.toFixed(2)}</span>
              </div>
              {ordenDetalle.descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Descuento:</span>
                  <span>-${ordenDetalle.descuento.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Costo de envío:</span>
                <span>${ordenDetalle.envio.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 8,
                marginTop: 4,
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#818cf8'
              }}>
                <span>Total:</span>
                <span>${ordenDetalle.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setModalDetalleAbierto(false)} className="btn btn-secondary">
                Cerrar Detalle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
