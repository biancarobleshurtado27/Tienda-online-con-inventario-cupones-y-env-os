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
import TableList from '../components/TableList.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
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
  DollarSign
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

  // Modal de confirmación para cancelar orden
  const [ordenACancelar, setOrdenACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

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
      // Captura y despliega error de la API (400, 404)
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
      // Muestra error 400 o 409 si el cambio de estado es inválido
      setActionError(err.message || 'Error al actualizar estado.');
    } finally {
      setProcesandoId(null);
    }
  };

  // Confirmar y Cancelar orden (desencadena reposición de stock atómica)
  const handleConfirmarCancelacion = async () => {
    if (!ordenACancelar) return;
    setCancelando(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await cancelarOrden(ordenACancelar.id);
      setActionSuccess(res.message || `Orden #${ordenACancelar.id} cancelada. Inventario repuesto con éxito.`);
      setOrdenACancelar(null);
      refetch();
      if (ordenDetalle && ordenDetalle.id === ordenACancelar.id) {
        setOrdenDetalle({ ...ordenDetalle, estado: 'cancelada' });
      }
    } catch (err) {
      // Captura y despliega error 400 o 409
      setActionError(err.message || 'No se puede cancelar esta orden.');
      setOrdenACancelar(null);
    } finally {
      setCancelando(false);
    }
  };

  // Determinar siguiente paso del flujo
  const getSiguienteEstado = (estado) => {
    if (estado === 'nueva') return 'pagada';
    if (estado === 'pagada') return 'enviada';
    if (estado === 'enviada') return 'entregada';
    return null;
  };

  // Columnas para TableList
  const columns = [
    { header: 'ID', width: '80px' },
    { header: 'Fecha', width: '160px' },
    { header: 'Cliente' },
    { header: 'Ciudad de Envío' },
    { header: 'Total', width: '120px' },
    { header: 'Estado', width: '140px' },
    { header: 'Acciones Permitidas', align: 'right', width: '260px' }
  ];

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
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por estado:</span>
        </div>
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

      {/* Tabla / Lista de Órdenes con TableList */}
      {loading ? (
        <LoadingState message="Cargando listado de órdenes..." />
      ) : (
        <TableList
          columns={columns}
          data={ordenes}
          keyExtractor={(o) => o.id}
          emptyTitle="No se encontraron órdenes"
          emptyMessage="No hay registros que coincidan con el filtro seleccionado."
          renderRow={(orden) => {
            const siguiente = getSiguienteEstado(orden.estado);
            const sePuedeCancelar = orden.estado === 'nueva' || orden.estado === 'pagada';
            const isProcessing = procesandoId === orden.id;

            return (
              <>
                <td style={{ padding: '14px 20px', fontWeight: 800 }}>#{orden.id}</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                  {orden.fecha ? new Date(orden.fecha).toLocaleDateString('es-CR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                  {orden.cliente?.nombre || orden.cliente_nombre || `Cliente #${orden.cliente_id}`}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                  {orden.cliente?.ciudad || orden.cliente_ciudad || '-'}
                </td>
                <td style={{ padding: '14px 20px', fontWeight: 800, color: 'white' }}>
                  ${orden.total.toFixed(2)}
                </td>
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
                        onClick={() => setOrdenACancelar(orden)}
                        disabled={isProcessing}
                        className="btn btn-danger btn-sm"
                        title="Cancelar orden y reponer inventario"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </>
            );
          }}
        />
      )}

      {/* Modal de Detalle de Orden (consume GET /api/ordenes/:id) */}
      <Modal
        isOpen={modalDetalleAbierto}
        onClose={() => setModalDetalleAbierto(false)}
        title={ordenDetalle ? `Detalle de la Orden #${ordenDetalle.id}` : 'Cargando...'}
      >
        {loadingDetalle ? (
          <LoadingState message="Consultando datos de la orden en el backend..." height="200px" />
        ) : ordenDetalle && (
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

            {/* Datos del Cliente y Cupón */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} /> Cliente & Destino
              </h4>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                <p><strong>Nombre:</strong> {ordenDetalle.cliente?.nombre || ordenDetalle.cliente_nombre}</p>
                <p><strong>Email:</strong> {ordenDetalle.cliente?.email || ordenDetalle.cliente_email}</p>
                <p><strong>Ciudad de entrega:</strong> {ordenDetalle.cliente?.ciudad || ordenDetalle.cliente_ciudad}</p>
                {(ordenDetalle.cupon || ordenDetalle.cupon_codigo) && (
                  <p style={{ color: 'var(--success)', marginTop: 4 }}>
                    <strong>Cupón aplicado:</strong> {ordenDetalle.cupon?.codigo || ordenDetalle.cupon_codigo} (-{ordenDetalle.cupon?.porcentaje || ordenDetalle.cupon_porcentaje}%)
                  </p>
                )}
              </div>
            </div>

            {/* Productos relacionados (orden_items) */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Artículos Comprados ({ordenDetalle.items?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(ordenDetalle.items || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
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
                        ${item.precio_unitario.toFixed(2)} x {item.cantidad} unidad(es)
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'white' }}>
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen financiero */}
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
                  <span>Descuento cupón:</span>
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

      {/* Confirmación de Cancelación */}
      <ConfirmModal
        isOpen={Boolean(ordenACancelar)}
        onClose={() => setOrdenACancelar(null)}
        onConfirm={handleConfirmarCancelacion}
        title={`¿Cancelar Orden #${ordenACancelar?.id}?`}
        message={`¿Estás seguro de que deseas cancelar la Orden #${ordenACancelar?.id}? Esta acción repondrá inmediatamente las unidades reservadas en el inventario del almacén.`}
        confirmText="Cancelar Orden"
        cancelText="Volver"
        isDestructive={true}
        loading={cancelando}
      />
    </div>
  );
}
