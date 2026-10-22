import React from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { getResumen } from '../services/api.js';
import MetricCard from '../components/MetricCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import AlertBox from '../components/AlertBox.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Tag, 
  Award, 
  AlertTriangle, 
  RefreshCw, 
  Layers 
} from 'lucide-react';

export default function DashboardPage() {
  const { data: resumen, loading, error, refetch } = useFetch(getResumen);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <LoadingState message="Cargando métricas del panel en tiempo real..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 30 }}>
        <AlertBox type="error" message={`No se pudo cargar el resumen: ${error}`} />
        <button onClick={refetch} className="btn btn-secondary">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  const {
    ventas_por_categoria = [],
    top_3_productos_mas_vendidos = [],
    totales = {},
    ordenes_por_estado = [],
    alertas_reposicion_stock = []
  } = resumen || {};

  // Calcular total de ventas para sacar porcentajes por categoría
  const totalVentasCategorias = ventas_por_categoria.reduce((acc, curr) => acc + (curr.total_ventas || 0), 0) || 1;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingUp size={28} color="#818cf8" />
            Panel de Métricas y Analítica
          </h1>
          <p className="page-subtitle">
            Indicadores en tiempo real calculados mediante consultas SQL (SUM, COUNT, GROUP BY).
          </p>
        </div>
        <button onClick={refetch} className="btn btn-secondary btn-sm">
          <RefreshCw size={16} /> Actualizar Datos
        </button>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <MetricCard
          title="Ingresos Totales"
          value={`$${(totales.total_ingresos || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Órdenes pagadas y despachadas"
          icon={DollarSign}
          color="success"
        />
        <MetricCard
          title="Valor Promedio / Orden"
          value={`$${(totales.valor_promedio_orden || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Ticket promedio global"
          icon={TrendingUp}
          color="primary"
        />
        <MetricCard
          title="Órdenes Activas"
          value={totales.total_ordenes || 0}
          subtitle="Excluyendo cancelaciones"
          icon={ShoppingBag}
          color="info"
        />
        <MetricCard
          title="Descuentos Otorgados"
          value={`$${(totales.total_descuentos_otorgados || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Ahorro aplicado por cupones"
          icon={Tag}
          color="warning"
        />
      </div>

      {/* Grid de 2 columnas: Ventas por Categoría y Top 3 Productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 24,
        marginBottom: 28
      }}>
        {/* Ventas por Categoría */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Layers size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Ventas por Categoría</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ventas_por_categoria.map((cat) => {
              const porcentaje = Math.round((cat.total_ventas / totalVentasCategorias) * 100);
              return (
                <div key={cat.categoria}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{cat.categoria}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ${cat.total_ventas.toFixed(2)} ({cat.unidades_vendidas} uds) · <strong>{porcentaje}%</strong>
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 8,
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${porcentaje}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                      borderRadius: 999,
                      transition: 'width 0.6s ease-in-out'
                    }}></div>
                  </div>
                </div>
              );
            })}
            {ventas_por_categoria.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay ventas registradas aún.</p>
            )}
          </div>
        </div>

        {/* Top 3 Productos más vendidos */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Award size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem' }}>Top 3 Productos Más Vendidos</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {top_3_productos_mas_vendidos.map((prod, index) => {
              const medallas = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: '1.6rem' }}>{medallas[index] || '⭐'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{prod.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Categoría: {prod.categoria} · Stock actual: {prod.stock} uds
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.95rem' }}>
                      {prod.total_vendido} vendidos
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      ${prod.ingresos_generados}
                    </div>
                  </div>
                </div>
              );
            })}
            {top_3_productos_mas_vendidos.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aún no se registran ítems vendidos.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fila Inferior: Conteo por Estado & Alertas de Reposición */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24
      }}>
        {/* Distribución por Estado */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Estado de las Órdenes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ordenes_por_estado.map((item) => (
              <div 
                key={item.estado}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  flex: '1 1 calc(50% - 10px)'
                }}
              >
                <StatusBadge estado={item.estado} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', marginLeft: 'auto' }}>
                  {item.cantidad}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reto extra: Alertas de Reposición */}
        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={22} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', color: '#fbbf24' }}>
              Alertas de Reposición (Stock Crítico)
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Productos con inventario bajo (&le; 5 unidades) que requieren reabastecimiento inmediato.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertas_reposicion_stock.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {item.stock} disponibles
                </span>
              </div>
            ))}
            {alertas_reposicion_stock.length === 0 && (
              <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                🎉 Todo el inventario se encuentra en niveles óptimos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
