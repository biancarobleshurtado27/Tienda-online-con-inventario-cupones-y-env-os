import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { getProductos } from '../../services/api.js';
import ProductCard from '../../components/public/ProductCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Store, 
  CheckCircle2, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

const CATEGORIAS = [
  'Todas',
  'Construcción',
  'Muñecas y figuras',
  'Juegos de mesa',
  'Peluches',
  'Arte y manualidades',
  'Vehículos y Exterior'
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaFromUrl = searchParams.get('categoria') || 'Todas';
  const busquedaFromUrl = searchParams.get('search') || '';

  const { data: productosData, loading, error, refetch } = useFetch(getProductos, [], []);
  const productos = useMemo(() => (Array.isArray(productosData) ? productosData : []), [productosData]);

  // Estados locales de filtrado
  const [busqueda, setBusqueda] = useState(busquedaFromUrl);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categoriaFromUrl);
  const [soloEnStock, setSoloEnStock] = useState(false);
  const [criterioOrden, setCriterioOrden] = useState('recomendados');

  // Sincronizar si cambia el parámetro de URL
  useEffect(() => {
    if (categoriaFromUrl && CATEGORIAS.includes(categoriaFromUrl)) {
      setCategoriaSeleccionada(categoriaFromUrl);
    }
  }, [categoriaFromUrl]);

  useEffect(() => {
    if (busquedaFromUrl) {
      setBusqueda(busquedaFromUrl);
    }
  }, [busquedaFromUrl]);

  // Manejo de cambio de categoría
  const handleSelectCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'Todas') {
      newParams.delete('categoria');
    } else {
      newParams.set('categoria', cat);
    }
    setSearchParams(newParams);
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('Todas');
    setSoloEnStock(false);
    setCriterioOrden('recomendados');
    setSearchParams({});
  };

  // Filtrado y ordenamiento en cliente
  const productosFiltrados = useMemo(() => {
    let result = [...productos];

    // Solo productos activos en la vitrina pública
    result = result.filter(p => p.activo === 1 || p.activo === true);

    // Filtro por categoría
    if (categoriaSeleccionada !== 'Todas') {
      result = result.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Filtro por disponibilidad
    if (soloEnStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Búsqueda por texto (nombre o descripción)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (criterioOrden === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
      if (criterioOrden === 'precio_asc') return a.precio - b.precio;
      if (criterioOrden === 'precio_desc') return b.precio - a.precio;
      // Recomendados: productos con mayor stock y activos
      if (criterioOrden === 'recomendados') return b.stock - a.stock;
      return 0;
    });

    return result;
  }, [productos, busqueda, categoriaSeleccionada, soloEnStock, criterioOrden]);

  return (
    <div className="container fade-in" style={{ paddingTop: 28, paddingBottom: 56 }}>
      {/* Encabezado del Catálogo */}
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--pastel-lavender-text)',
          backgroundColor: 'var(--pastel-lavender-light)',
          padding: '4px 14px',
          borderRadius: 9999,
          marginBottom: 10
        }}>
          <Store size={14} strokeWidth={2.4} />
          <span>Vitrina Completa de Juguetes</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: 8
        }}>
          Catálogo Mágico de Juguetes
        </h1>

        <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          Explora nuestra selección completa de juguetes infantiles clasificados por categoría pedagógica, listos para enviar a tu hogar.
        </p>
      </div>

      {/* Píldoras de Filtro Rápido por Categoría */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 12,
        marginBottom: 24,
        scrollbarWidth: 'none'
      }}>
        {CATEGORIAS.map((cat) => {
          const isSelected = categoriaSeleccionada === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategoria(cat)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: '0.84rem',
                fontWeight: 700,
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 8px rgba(142, 116, 190, 0.25)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Barra de Búsqueda, Disponibilidad y Orden */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 32 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          alignItems: 'center'
        }}>
          {/* Campo de búsqueda */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} 
            />
            <input
              type="text"
              placeholder="Buscar por juguete o temática..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input"
              style={{ paddingLeft: 42 }}
            />
          </div>

          {/* Toggle de Disponibilidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.86rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={soloEnStock}
                onChange={(e) => setSoloEnStock(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: 'var(--pastel-lavender)',
                  cursor: 'pointer'
                }}
              />
              <span>Solo con existencias disponibles</span>
            </label>
          </div>

          {/* Selector de Orden */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpDown size={17} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <select
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value)}
              className="select"
            >
              <option value="recomendados">Recomendados del Taller</option>
              <option value="nombre_asc">Nombre (A - Z)</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Resumen de Resultados y Limpieza de Filtros */}
        <div style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <span>
            Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> juguetes en vitrina
          </span>

          {(busqueda || categoriaSeleccionada !== 'Todas' || soloEnStock || criterioOrden !== 'recomendados') && (
            <button
              onClick={handleLimpiarFiltros}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={13} /> Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Contenido: Loading, Error, Empty o Grid de Juguetes */}
      {loading ? (
        <LoadingState message="Buscando juguetes en el taller de Mundo Juguete..." />
      ) : error ? (
        <ErrorState 
          title="Error al consultar el catálogo"
          message={error}
          onRetry={refetch}
        />
      ) : productosFiltrados.length === 0 ? (
        <EmptyState
          title="No encontramos ningún juguete con esos filtros"
          description="Prueba con otra palabra clave o selecciona otra categoría pedagógica."
          actionText="Ver todos los juguetes"
          onAction={handleLimpiarFiltros}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}>
          {productosFiltrados.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
