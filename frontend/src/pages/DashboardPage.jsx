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
            <TrendingUp size={28} color="var(--primary)" strokeWidth={2.3} />
            Panel de Métricas y Analítica
          </h1>
          <p className="page-subtitle">
            Indicadores en tiempo real calculados mediante consultas SQL (SUM, COUNT, GROUP BY).
          </p>
        </div>
        <button onClick={refetch} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} strokeWidth={2.2} /> Actualizar Datos
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
            <Layers size={22} color="var(--primary)" strokeWidth={2.2} />
            <h3 style={{ fontSize: '1.15rem' }}>Ventas por Categoría</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ventas_por_categoria.map((cat) => {
              const porcentaje = Math.round((cat.total_ventas / totalVentasCategorias) * 100);
              return (
                <div key={cat.categoria}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.categoria}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ${cat.total_ventas.toFixed(2)} ({cat.unidades_vendidas} uds) · <strong>{porcentaje}%</strong>
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 9,
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 9999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${porcentaje}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--pastel-rose) 0%, var(--pastel-lavender) 100%)',
                      borderRadius: 9999,
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
            <Award size={22} color="var(--pastel-butter-text)" strokeWidth={2.2} />
            <h3 style={{ fontSize: '1.15rem' }}>Top 3 Productos Más Vendidos</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {top_3_productos_mas_vendidos.map((prod, index) => {
              const rankStyles = [
                { bg: 'var(--pastel-butter-light)', text: 'var(--pastel-butter-text)', border: 'rgba(214, 164, 41, 0.3)' },
                { bg: 'var(--pastel-lavender-light)', text: 'var(--pastel-lavender-text)', border: 'rgba(142, 116, 190, 0.3)' },
                { bg: 'var(--pastel-rose-light)', text: 'var(--pastel-rose-text)', border: 'rgba(222, 123, 148, 0.3)' }
              ];
              const currentRank = rankStyles[index] || rankStyles[2];

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
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9999,
                    backgroundColor: currentRank.bg,
                    border: `1px solid ${currentRank.border}`,
                    color: currentRank.text,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>{prod.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Categoría: {prod.categoria} · Stock: {prod.stock} uds
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--pastel-mint-text)', fontSize: '0.95rem' }}>
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
                  padding: '12px 18px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  flex: '1 1 calc(50% - 10px)'
                }}
              >
                <StatusBadge estado={item.estado} />
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  marginLeft: 'auto',
                  color: 'var(--text-main)'
                }}>
                  {item.cantidad}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reto extra: Alertas de Reposición */}
        <div className="card" style={{ borderColor: 'rgba(214, 164, 41, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={22} color="var(--pastel-butter-text)" strokeWidth={2.2} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--pastel-butter-text)' }}>
              Alertas de Reposición (Stock Crítico)
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Juguetes con inventario bajo (&le; 5 unidades) que requieren reabastecimiento en el almacén.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertas_reposicion_stock.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--pastel-butter-light)',
                  border: '1px solid rgba(214, 164, 41, 0.25)',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.nombre}</span>
                <span style={{
                  backgroundColor: 'var(--pastel-rose-light)',
                  color: 'var(--pastel-rose-text)',
                  border: '1px solid rgba(222, 123, 148, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>
                  {item.stock} disponibles
                </span>
              </div>
            ))}
            {alertas_reposicion_stock.length === 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--pastel-mint-light)',
                border: '1px solid rgba(65, 160, 125, 0.25)',
                color: 'var(--pastel-mint-text)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <Award size={18} strokeWidth={2.2} />
                <span>Todo el inventario se encuentra en niveles óptimos.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
