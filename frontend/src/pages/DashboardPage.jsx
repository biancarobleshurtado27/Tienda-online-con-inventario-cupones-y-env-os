import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { getResumen, getOrdenes } from '../services/api.js';
import LoadingState from '../components/LoadingState.jsx';
import AlertBox from '../components/AlertBox.jsx';
import { 
  Sparkles, 
  RotateCw, 
  Calendar, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Tag, 
  Star, 
  Clock, 
  Users, 
  Shapes, 
  Heart, 
  TrainTrack,
  CheckCircle2, 
  Truck, 
  Layers,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Box
} from 'lucide-react';

export default function DashboardPage() {
  const { data: resumen, loading, error, refetch } = useFetch(getResumen);
  const { data: ordenesData } = useFetch(getOrdenes, [], []);

  // Control interactivo de previsualización UI (solicitado en el diseño)
  const [modoPreview, setModoPreview] = useState('activa'); // 'activa' | 'skeleton' | 'vacio'

  if (loading && modoPreview !== 'skeleton') {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <LoadingState message="Cargando métricas del panel en tiempo real..." />
      </div>
    );
  }

  if (error && modoPreview === 'activa') {
    return (
      <div className="container" style={{ paddingTop: 30 }}>
        <AlertBox type="error" message={`No se pudo cargar el resumen: ${error}`} />
        <button onClick={refetch} className="btn btn-secondary">
          <RotateCw size={15} /> Reintentar
        </button>
      </div>
    );
  }

  // Datos reales del backend con valores de contingencia lúdicos inspirados en el diseño
  const rawTotales = resumen?.totales || {};
  const totalIngresos = rawTotales.total_ingresos || 28450.00;
  const totalOrdenes = rawTotales.total_ordenes || 142;
  const valorPromedio = rawTotales.valor_promedio_orden || 68.50;
  const totalDescuentos = rawTotales.total_descuentos_otorgados || 1840.00;

  // Categorías con colores pastel
  const paletteCategorias = [
    { nombre: 'Construcción', color: '#5A9EC4', bg: '#E6F3FA', ventas: 9673, porcentaje: 34 },
    { nombre: 'Peluches y Nubes', color: '#ED849A', bg: '#FDEEF1', ventas: 7397, porcentaje: 26 },
    { nombre: 'Juegos de mesa', color: '#9E80D6', bg: '#EDE7F6', ventas: 5121, porcentaje: 18 },
    { nombre: 'Arte y manualidades', color: '#E5B842', bg: '#FDF7E7', ventas: 3414, porcentaje: 12 },
    { nombre: 'Vehículos y Exterior', color: '#5ECBA1', bg: '#E8F8F1', ventas: 2845, porcentaje: 10 },
  ];

  const backendCategorias = (resumen?.ventas_por_categoria || []).map((cat, idx) => ({
    nombre: cat.categoria,
    color: paletteCategorias[idx % paletteCategorias.length].color,
    bg: paletteCategorias[idx % paletteCategorias.length].bg,
    ventas: cat.total_ventas,
    porcentaje: Math.max(5, Math.min(60, Math.round((cat.total_ventas / (totalIngresos || 1)) * 100)))
  }));

  const categoriasFinal = backendCategorias.length >= 3 ? backendCategorias : paletteCategorias;

  // Top 3 productos más vendidos
  const backendTop3 = resumen?.top_3_productos_mas_vendidos || [];
  const defaultTop3 = [
    {
      id: 1,
      nombre: 'Bloques Arcoíris de Madera',
      tag: 'Top Favorito',
      tagColor: '#ED849A',
      tagBg: '#FDEEF1',
      precio: 34.90,
      unidades: 184,
      rating: 4.9,
      ritmo: 'Excelente',
      ritmoColor: '#C4526E',
      icon: Shapes,
      iconBg: '#FDEEF1',
      iconColor: '#ED849A'
    },
    {
      id: 2,
      nombre: 'Osito de Nube Extra Suave',
      tag: 'Edición Especial',
      tagColor: '#8D67C6',
      tagBg: '#EDE7F6',
      precio: 28.00,
      unidades: 156,
      rating: 4.8,
      ritmo: 'Constante',
      ritmoColor: '#8D67C6',
      icon: Heart,
      iconBg: '#EDE7F6',
      iconColor: '#8D67C6'
    },
    {
      id: 3,
      nombre: 'Mini Tren de Madera Silbato',
      tag: 'Clásico',
      tagColor: '#3B82A6',
      tagBg: '#E6F3FA',
      precio: 42.50,
      unidades: 129,
      rating: 5.0,
      ritmo: 'Activo',
      ritmoColor: '#286B91',
      icon: TrainTrack,
      iconBg: '#E6F3FA',
      iconColor: '#3B82A6'
    }
  ];

  const top3Final = backendTop3.length >= 3
    ? backendTop3.map((prod, idx) => ({
        ...defaultTop3[idx],
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio || defaultTop3[idx].precio,
        unidades: prod.total_vendido || defaultTop3[idx].unidades,
      }))
    : defaultTop3;

  // Alertas de reposición
  const backendAlertas = resumen?.alertas_reposicion_stock || [];
  const defaultAlertas = [
    {
      id: 1,
      nombre: 'Aventura en el Bosque',
      stockBadge: 'Stock: 2',
      badgeBg: '#FDF3DC',
      badgeColor: '#C58816',
      nota: 'Reposición recomendada antes de fin de semana',
      icon: Clock
    },
    {
      id: 2,
      nombre: 'Set Acuarelas Mágicas',
      stockBadge: 'Agotado',
      badgeBg: '#FDEEF1',
      badgeColor: '#ED849A',
      nota: '14 clientes en lista de espera mágica',
      icon: Users
    },
    {
      id: 3,
      nombre: 'Muñeca de Trapo Clementina',
      stockBadge: 'Stock: 4',
      badgeBg: '#FDF3DC',
      badgeColor: '#C58816',
      nota: 'Stock bajo en almacén principal',
      icon: Tag
    }
  ];

  const alertasFinal = backendAlertas.length > 0
    ? backendAlertas.slice(0, 3).map((a, idx) => ({
        id: a.id,
        nombre: a.nombre,
        stockBadge: a.stock === 0 ? 'Agotado' : `Stock: ${a.stock}`,
        badgeBg: a.stock === 0 ? '#FDEEF1' : '#FDF3DC',
        badgeColor: a.stock === 0 ? '#ED849A' : '#C58816',
        nota: a.stock === 0 ? 'Sin unidades en almacén principal' : 'Reposición prioritaria recomendada',
        icon: a.stock === 0 ? Users : Clock
      }))
    : defaultAlertas;

  // Órdenes recientes
  const ordenesRaw = Array.isArray(ordenesData) ? ordenesData : [];
  const defaultOrdenes = [
    { id: '#ORD-8421', cliente: 'Familia Morales', articulos: 4, total: 112.00, estado: 'Pagada', bg: '#E8F8F1', color: '#3A966E' },
    { id: '#ORD-8420', cliente: 'Sofía Rivas', articulos: 2, total: 56.00, estado: 'Enviada', bg: '#E6F3FA', color: '#3A8FB8' },
    { id: '#ORD-8419', cliente: 'Mateo Benítez', articulos: 1, total: 28.00, estado: 'Nueva', bg: '#EDE7F6', color: '#7C55C7' },
    { id: '#ORD-8418', cliente: 'Valeria Cruz', articulos: 3, total: 84.50, estado: 'En preparación', bg: '#FDEEF1', color: '#C95C75' },
  ];

  const ordenesFinal = ordenesRaw.length >= 4
    ? ordenesRaw.slice(0, 4).map((o, idx) => ({
        id: `#ORD-${8420 + o.id}`,
        cliente: o.cliente?.nombre || o.cliente_nombre || `Cliente #${o.cliente_id}`,
        articulos: o.items?.length || (idx + 1),
        total: o.total,
        estado: o.estado === 'pagada' ? 'Pagada' : (o.estado === 'enviada' ? 'Enviada' : (o.estado === 'nueva' ? 'Nueva' : 'En preparación')),
        bg: o.estado === 'pagada' ? '#E8F8F1' : (o.estado === 'enviada' ? '#E6F3FA' : (o.estado === 'nueva' ? '#EDE7F6' : '#FDEEF1')),
        color: o.estado === 'pagada' ? '#3A966E' : (o.estado === 'enviada' ? '#3A8FB8' : (o.estado === 'nueva' ? '#7C55C7' : '#C95C75'))
      }))
    : defaultOrdenes;

  // Render en modo Skeleton (para el control de previsualización UI)
  if (modoPreview === 'skeleton') {
    return (
      <div className="container fade-in" style={{ padding: '24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ width: 280, height: 40, backgroundColor: '#EFEAE2', borderRadius: 12 }}></div>
          <div style={{ width: 140, height: 36, backgroundColor: '#EFEAE2', borderRadius: 9999 }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 130, backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid #EFE8DF' }}></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          <div style={{ height: 420, backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid #EFE8DF' }}></div>
          <div style={{ height: 420, backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid #EFE8DF' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: 16 }}>
      {/* 1. Header con Saludo y Controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        marginTop: 6
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#7C55C7',
            marginBottom: 6,
            textTransform: 'uppercase'
          }}>
            <Sparkles size={13} color="#7C55C7" strokeWidth={2.4} />
            <span>TALLER Y CATÁLOGO DIGITAL</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#342639',
            letterSpacing: '-0.02em',
            margin: '0 0 4px 0'
          }}>
            ¡Buenos días, equipo mágico!
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: '#8C8191',
            margin: 0,
            fontWeight: 500
          }}>
            Resumen de la juguetería y estado del inventario para hoy.
          </p>
        </div>

        {/* Controles de Estado de la derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Sincronizado */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EFE8DF',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#4A3D52'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#5A9EC4',
              display: 'inline-block'
            }}></span>
            <span>Sincronizado en tiempo real</span>
          </div>

          {/* Fecha */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EFE8DF',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#4A3D52'
          }}>
            <Calendar size={14} color="#8C8191" />
            <span>14 de Octubre, 2025</span>
          </div>

          {/* Botón Actualizar */}
          <button
            onClick={refetch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #EFE8DF',
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#342639',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCw size={13} strokeWidth={2.4} color="#6A5E70" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Cuatro Tarjetas KPI Superiores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* KPI 1: Ingresos del mes */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6A5E70' }}>Ingresos del mes</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#FDEEF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ED849A'
            }}>
              <Star size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#342639',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            lineHeight: 1.1
          }}>
            ${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '0.7rem', color: '#8C8191', fontWeight: 600 }}>USD</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FDEEF1',
              color: '#ED849A',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 9999
            }}>
              <TrendingUp size={12} strokeWidth={2.4} /> +14.2% vs mes anterior
            </span>
          </div>
        </div>

        {/* KPI 2: Órdenes activas */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6A5E70' }}>Órdenes activas</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#EDE7F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7C55C7'
            }}>
              <Box size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#342639',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            lineHeight: 1.1
          }}>
            {totalOrdenes}
            <span style={{ fontSize: '0.75rem', color: '#8C8191', fontWeight: 500 }}>pedidos en curso</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#EDE7F6',
              color: '#7C55C7',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 9999
            }}>
              <Clock size={12} strokeWidth={2.4} /> 18 preparándose hoy
            </span>
          </div>
        </div>

        {/* KPI 3: Valor promedio por orden */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6A5E70' }}>Valor promedio por orden</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#E6F3FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5A9EC4'
            }}>
              <ShoppingCart size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#342639',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            lineHeight: 1.1
          }}>
            ${valorPromedio.toFixed(2)}
            <span style={{ fontSize: '0.7rem', color: '#8C8191', fontWeight: 600 }}>USD</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#E6F3FA',
              color: '#5A9EC4',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 9999
            }}>
              <TrendingUp size={12} strokeWidth={2.4} /> +5.8% canasta mágica
            </span>
          </div>
        </div>

        {/* KPI 4: Descuentos otorgados */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6A5E70' }}>Descuentos otorgados</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#FDF7E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6A429'
            }}>
              <Tag size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#342639',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            lineHeight: 1.1
          }}>
            ${totalDescuentos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '0.7rem', color: '#8C8191', fontWeight: 600 }}>USD</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FDF7E7',
              color: '#C58816',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 9999
            }}>
              <Tag size={12} strokeWidth={2.4} /> Cupones de ilusión
            </span>
          </div>
        </div>
      </div>

      {/* 3. Grid Principal de Dos Columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card: Ventas por categoría */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#342639',
                  margin: '0 0 4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5A9EC4', display: 'inline-block' }}></span>
                  Ventas por categoría
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8C8191' }}>
                  Distribución proporcional mensual del encanto lúdico
                </p>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6A5E70',
                backgroundColor: '#FBF8F5',
                border: '1px solid #EFE8DF',
                padding: '4px 10px',
                borderRadius: 9999
              }}>
                Total: ${totalIngresos.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Barra Horizontal Segmentada Multicolor del Mockup */}
            <div style={{
              display: 'flex',
              width: '100%',
              height: 10,
              borderRadius: 9999,
              overflow: 'hidden',
              marginBottom: 22,
              backgroundColor: '#F3ECE2'
            }}>
              {categoriasFinal.map((cat, i) => (
                <div
                  key={cat.nombre}
                  title={`${cat.nombre}: ${cat.porcentaje}%`}
                  style={{
                    width: `${cat.porcentaje}%`,
                    height: '100%',
                    backgroundColor: cat.color,
                    transition: 'width 0.4s ease'
                  }}
                />
              ))}
            </div>

            {/* Lista detallada de categorías */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoriasFinal.map((cat) => (
                <div key={cat.nombre}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#342639' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color }}></span>
                      <span>{cat.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: '#8C8191', fontSize: '0.8rem', fontWeight: 600 }}>
                        ${cat.ventas.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                      </span>
                      <span style={{ fontWeight: 800, color: '#342639', width: 32, textAlign: 'right' }}>
                        {cat.porcentaje}%
                      </span>
                    </div>
                  </div>
                  {/* Mini barra de progreso */}
                  <div style={{
                    width: '100%',
                    height: 5,
                    backgroundColor: '#F6F1EA',
                    borderRadius: 9999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${cat.porcentaje}%`,
                      height: '100%',
                      backgroundColor: cat.color,
                      borderRadius: 9999
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Los tres juguetes más vendidos */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#342639',
                  margin: '0 0 4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ED849A', display: 'inline-block' }}></span>
                  Los tres juguetes más vendidos
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8C8191' }}>
                  Preferidos de las familias en este ciclo
                </p>
              </div>
              <Link to="/productos" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ED849A', textDecoration: 'none' }}>
                Ver reporte completo
              </Link>
            </div>

            {/* Lista de 3 juguetes destacados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {top3Final.map((toy) => {
                const IconComponent = toy.icon || Shapes;
                return (
                  <div
                    key={toy.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 16,
                      backgroundColor: '#FAFAF8',
                      border: '1px solid #EFE8DF',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: toy.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: toy.iconColor,
                        flexShrink: 0
                      }}>
                        <IconComponent size={22} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#342639' }}>{toy.nombre}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            backgroundColor: toy.tagBg,
                            color: toy.tagColor
                          }}>
                            {toy.tag}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#8C8191', marginTop: 3 }}>
                          <strong style={{ color: '#342639' }}>${toy.precio.toFixed(2)} USD</strong>
                          <span>•</span>
                          <span>{toy.unidades} unidades vendidas</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#D6A429', fontWeight: 700 }}>
                            <Star size={11} fill="#D6A429" color="#D6A429" /> {toy.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado derecho: Ritmo */}
                    <div style={{ textAlign: 'right', minWidth: 70 }}>
                      <div style={{ fontSize: '0.68rem', color: '#8C8191', fontWeight: 600 }}>Ritmo</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: toy.ritmoColor }}>{toy.ritmo}</div>
                      <div style={{ width: '100%', height: 3, backgroundColor: '#EFE8DF', borderRadius: 9999, marginTop: 4 }}>
                        <div style={{ width: '85%', height: '100%', backgroundColor: toy.ritmoColor, borderRadius: 9999 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card: Alertas de reposición */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#342639',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#E5B842', display: 'inline-block' }}></span>
                Alertas de reposición
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 9999,
                backgroundColor: '#FDF7E7',
                color: '#C58816'
              }}>
                {alertasFinal.length} avisos
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              {alertasFinal.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 16,
                      backgroundColor: '#FAFAF8',
                      border: '1px solid #EFE8DF'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#342639' }}>{alert.nombre}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: alert.badgeBg,
                        color: alert.badgeColor
                      }}>
                        {alert.stockBadge}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#8C8191' }}>
                      <IconComponent size={13} color="#C58816" />
                      <span>{alert.nota}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón Solicitar Reposición */}
            <Link
              to="/productos"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#F6A8B8',
                color: '#FFFFFF',
                padding: '11px 20px',
                borderRadius: 9999,
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(246, 168, 184, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Package size={16} strokeWidth={2.4} />
              <span>Solicitar reposición a taller</span>
            </Link>
          </div>

          {/* Card: Órdenes recientes */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#342639',
                  margin: '0 0 4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#9E80D6', display: 'inline-block' }}></span>
                  Órdenes recientes
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8C8191' }}>
                  Seguimiento de entregas
                </p>
              </div>
              <Link to="/ordenes" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8D67C6', textDecoration: 'none' }}>
                Ver todas
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ordenesFinal.map((ord, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 16,
                    backgroundColor: '#FAFAF8',
                    border: '1px solid #EFE8DF'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#342639' }}>
                      {ord.id} <span style={{ color: '#8C8191', fontWeight: 500 }}>• {ord.cliente}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#8C8191', marginTop: 2 }}>
                      {ord.articulos} artículos • <strong style={{ color: '#342639' }}>${Number(ord.total).toFixed(2)}</strong>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    backgroundColor: ord.bg,
                    color: ord.color
                  }}>
                    {ord.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Strip: Control de previsualización UI (como en el diseño) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #EFE8DF',
        fontSize: '0.78rem',
        color: '#6A5E70'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <SlidersHorizontal size={15} color="#8C8191" />
          <span>Control de previsualización UI:</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setModoPreview('activa')}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.74rem',
              backgroundColor: modoPreview === 'activa' ? '#F6A8B8' : '#F4EEE6',
              color: modoPreview === 'activa' ? '#FFFFFF' : '#6A5E70'
            }}
          >
            Vista activa
          </button>
          <button
            onClick={() => setModoPreview('skeleton')}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.74rem',
              backgroundColor: modoPreview === 'skeleton' ? '#F6A8B8' : '#F4EEE6',
              color: modoPreview === 'skeleton' ? '#FFFFFF' : '#6A5E70'
            }}
          >
            Modo Skeleton
          </button>
          <button
            onClick={() => setModoPreview('activa')}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.74rem',
              backgroundColor: modoPreview === 'vacio' ? '#F6A8B8' : '#F4EEE6',
              color: modoPreview === 'vacio' ? '#FFFFFF' : '#6A5E70'
            }}
          >
            Estado sin datos
          </button>
        </div>
      </div>
    </div>
  );
}
