import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  generarDescripcionIA 
} from '../services/api.js';
import { getToyImageUrl, DEFAULT_TOY_IMAGE } from '../utils/toyImages.js';
import Modal from '../components/Modal.jsx';
import AlertBox from '../components/AlertBox.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import FormField from '../components/FormField.jsx';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  Check,
  Circle,
  Wrench,
  Layers,
  Store,
  Info
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

export default function ProductosPage() {
  const location = useLocation();
  const { data: productosData, loading, error, refetch } = useFetch(getProductos, [], []);
  const productos = useMemo(() => (Array.isArray(productosData) ? productosData : []), [productosData]);

  // Estados de búsqueda, filtros y orden
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [criterioOrden, setCriterioOrden] = useState('nombre_asc');

  // Modal para Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Modal de Confirmación para Eliminar
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Alertas de página
  const [pageError, setPageError] = useState(null);
  const [pageSuccess, setPageSuccess] = useState(null);

  // Formulario controlado
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'Construcción',
    activo: 1,
  });

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  // Abrir modal para crear
  const handleOpenCrear = () => {
    setProductoEnEdicion(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: 'Construcción',
      activo: 1,
    });
    setFormError(null);
    setFormSuccess(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const handleOpenEditar = (prod) => {
    setProductoEnEdicion(prod);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      stock: prod.stock,
      categoria: prod.categoria,
      activo: prod.activo,
    });
    setFormError(null);
    setFormSuccess(null);
    setModalAbierto(true);
  };

  // Abrir automáticamente el modal si la URL contiene ?nuevo=1 o ?accion=nuevo
  // o aplicar búsqueda si viene desde el navbar con ?search=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('nuevo') === '1' || params.get('accion') === 'nuevo') {
      handleOpenCrear();
    }
    const q = params.get('search');
    if (q) {
      setBusqueda(q);
    }
  }, [location.search]);

  // Asistente IA para generar descripción comercial
  const handleGenerarDescripcionIA = async () => {
    if (!formData.nombre.trim()) {
      setFormError('Ingresa primero el nombre del producto para que la IA genere la descripción.');
      return;
    }
    setGenerandoIA(true);
    setFormError(null);
    try {
      const resp = await generarDescripcionIA(formData.nombre, formData.categoria);
      if (resp?.data?.descripcion_generada) {
        setFormData(prev => ({
          ...prev,
          descripcion: resp.data.descripcion_generada
        }));
        setFormSuccess(`¡Descripción generada con éxito vía ${resp.data.fuente || 'IA Copilot'}!`);
      }
    } catch (err) {
      setFormError(`Error con el asistente IA: ${err.message}`);
    } finally {
      setGenerandoIA(false);
    }
  };

  // Guardar (Crear o Editar) con validación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validación estricta en el cliente
    if (!formData.nombre.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    const precioNum = parseFloat(formData.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setFormError('El precio debe ser un número positivo finito mayor a 0.');
      return;
    }
    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: precioNum,
        stock: stockNum,
        categoria: formData.categoria,
        activo: formData.activo ? 1 : 0,
      };

      if (productoEnEdicion) {
        await updateProducto(productoEnEdicion.id, payload);
        setPageSuccess(`Producto "${payload.nombre}" actualizado exitosamente.`);
      } else {
        await createProducto(payload);
        setPageSuccess(`Producto "${payload.nombre}" creado exitosamente.`);
      }

      setModalAbierto(false);
      refetch();
    } catch (err) {
      // Muestra el mensaje exacto devuelto por la API (400, 404, 409)
      setFormError(err.message || 'Error al procesar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar y Ejecutar Eliminación
  const handleConfirmDelete = async () => {
    if (!productoAEliminar) return;
    setEliminando(true);
    setPageError(null);
    setPageSuccess(null);
    try {
      const res = await deleteProducto(productoAEliminar.id);
      setPageSuccess(res.message || `Producto "${productoAEliminar.nombre}" eliminado correctamente.`);
      setProductoAEliminar(null);
      refetch();
    } catch (err) {
      // Muestra error 400 o 409 de la API
      setPageError(err.message || 'Error al eliminar el producto.');
      setProductoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  // Filtros, búsqueda y ordenamiento
  const productosFiltrados = useMemo(() => {
    let result = [...(productos || [])];

    // Filtro por categoría
    if (categoriaSeleccionada !== 'Todas') {
      result = result.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Búsqueda por texto (nombre o descripción)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    }

    // Criterio de ordenamiento
    result.sort((a, b) => {
      if (criterioOrden === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
      if (criterioOrden === 'precio_asc') return a.precio - b.precio;
      if (criterioOrden === 'precio_desc') return b.precio - a.precio;
      if (criterioOrden === 'stock_asc') return a.stock - b.stock;
      if (criterioOrden === 'stock_desc') return b.stock - a.stock;
      return 0;
    });

    return result;
  }, [productos, busqueda, categoriaSeleccionada, criterioOrden]);

  return (
    <div className="container fade-in">
      {/* ENCABEZADO PRINCIPAL DE LA PÁGINA */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">
            <Package size={28} color="var(--primary)" strokeWidth={2.3} />
            Catálogo & Editor de Juguetes
          </h1>
          <p className="page-subtitle">
            Página central de Mundo Juguete: incluye la zona de gestión/edición en el taller y la vitrina de exploración infantil.
          </p>
        </div>
      </div>

      {error && <AlertBox type="error" message={error} />}
      {pageError && <AlertBox type="error" message={pageError} onClose={() => setPageError(null)} />}
      {pageSuccess && <AlertBox type="success" message={pageSuccess} onClose={() => setPageSuccess(null)} />}

      {/* ========================================================
          PARTE 1: ZONA DEL TALLER & EDITOR DE JUGUETES (GESTIÓN)
          ======================================================== */}
      <section style={{ marginBottom: 36 }}>
        <div className="card" style={{
          padding: '24px 26px',
          borderLeft: '5px solid var(--primary)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 18px rgba(47, 38, 54, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 18
          }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '4px 12px',
                borderRadius: 9999,
                backgroundColor: 'var(--pastel-lavender-light)',
                color: 'var(--pastel-lavender-text)',
                marginBottom: 10
              }}>
                <Wrench size={13} strokeWidth={2.5} /> SECCIÓN DE EDICIÓN Y GESTIÓN
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.38rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: 6
              }}>
                Taller & Editor de Juguetes
              </h2>
              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                margin: 0
              }}>
                Esta sección está destinada al personal del taller para administrar el inventario. Permite dar de alta juguetes nuevos, actualizar precios, reabastecer stock, alternar estado activo/inactivo y redactar descripciones comerciales automáticas con IA Copilot.
              </p>
            </div>

            <button 
              onClick={handleOpenCrear} 
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 22px',
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px rgba(232, 137, 156, 0.3)'
              }}
            >
              <Plus size={18} strokeWidth={2.5} /> Abrir Editor / Crear Nuevo Juguete
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} color="var(--pastel-mint-text)" strokeWidth={2.5} /> Alta rápida con validación de precios y stock
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--pastel-lavender-text)" strokeWidth={2.5} /> Asistente de redacción IA Copilot (n8n)
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={14} color="var(--primary)" strokeWidth={2.5} /> Botón de edición directa en cada tarjeta
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          PARTE 2: VITRINA & CATÁLOGO DE JUGUETES (EXPLORACIÓN)
          ======================================================== */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: 'var(--pastel-butter-light)',
            color: 'var(--pastel-butter-text)',
            marginBottom: 8
          }}>
            <Store size={13} strokeWidth={2.5} /> SECCIÓN DE EXHIBICIÓN Y CATÁLOGO
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.38rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: 4
          }}>
            Catálogo & Vitrina de Juguetes
          </h2>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            margin: 0
          }}>
            Esta sección exhibe todos los juguetes de Mundo Juguete con su fotografía ilustrativa, precio, categoría y estado de existencias en tiempo real.
          </p>
        </div>

        {/* Barra de Filtros, Búsqueda y Orden */}
        <div className="card" style={{ padding: '18px 22px', marginBottom: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
            alignItems: 'center'
          }}>
            {/* Búsqueda por texto */}
            <div style={{ position: 'relative' }}>
              <Search 
                size={18} 
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} 
              />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>

            {/* Filtro por Categoría */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="select"
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>Categoría: {cat}</option>
                ))}
              </select>
            </div>

            {/* Criterio de Ordenamiento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowUpDown size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <select
                value={criterioOrden}
                onChange={(e) => setCriterioOrden(e.target.value)}
                className="select"
              >
                <option value="nombre_asc">Nombre (A-Z)</option>
                <option value="precio_asc">Precio (Menor a Mayor)</option>
                <option value="precio_desc">Precio (Mayor a Menor)</option>
                <option value="stock_asc">Stock (Menor a Mayor)</option>
                <option value="stock_desc">Stock (Mayor a Menor)</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> juguetes</span>
            {(busqueda || categoriaSeleccionada !== 'Todas') && (
              <button
                onClick={() => { setBusqueda(''); setCategoriaSeleccionada('Todas'); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid de Productos o Estado de Carga */}
        {loading ? (
          <LoadingState message="Cargando catálogo de juguetes de Mundo Juguete..." />
        ) : productosFiltrados.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3>No se encontraron juguetes</h3>
            <p style={{ marginTop: 6, fontSize: '0.9rem' }}>Intenta ajustar los criterios de búsqueda o agrega un nuevo juguete desde el editor.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 22
          }}>
            {productosFiltrados.map((prod) => (
              <div 
                key={prod.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div>
                  {/* Fotografía Ilustrativa del Juguete */}
                  <div style={{
                    width: '100%',
                    height: 185,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: 14,
                    position: 'relative',
                    backgroundColor: '#F5EFE6',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)'
                  }}>
                    <img 
                      src={getToyImageUrl(prod)} 
                      alt={prod.nombre}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.35s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_TOY_IMAGE;
                      }}
                    />

                    {/* Badge de Categoría flotante sobre la foto */}
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontSize: '0.72rem',
                      letterSpacing: '0.02em',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      color: 'var(--pastel-lavender-text)',
                      border: '1px solid rgba(142, 116, 190, 0.25)',
                      boxShadow: '0 2px 6px rgba(47, 38, 54, 0.08)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {prod.categoria}
                    </span>

                    {/* Badge de Stock flotante sobre la foto */}
                    <span style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      color: prod.stock > 5 ? 'var(--pastel-mint-text)' : (prod.stock > 0 ? 'var(--pastel-butter-text)' : 'var(--pastel-rose-text)'),
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 2px 6px rgba(47, 38, 54, 0.08)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {prod.stock > 0 ? `${prod.stock} en stock` : 'Agotado'}
                    </span>
                  </div>

                  {/* Título del Juguete */}
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    marginBottom: 6,
                    lineHeight: 1.35,
                    color: 'var(--text-main)'
                  }}>
                    {prod.nombre}
                  </h3>

                  {/* Descripción comercial */}
                  <p style={{
                    fontSize: '0.83rem',
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5
                  }}>
                    {prod.descripcion || 'Sin descripción comercial registrada en el taller.'}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-color)',
                    marginBottom: 12
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: 'var(--text-main)'
                    }}>
                      ${prod.precio.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {prod.activo ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--pastel-mint-text)', fontWeight: 700 }}>
                          <Check size={13} strokeWidth={2.5} /> Activo
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)', fontWeight: 600 }}>
                          <Circle size={11} strokeWidth={2} /> Inactivo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de gestión en el taller */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => handleOpenEditar(prod)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      title="Editar en el taller"
                    >
                      <Edit3 size={14} strokeWidth={2} /> Editar en Taller
                    </button>
                    <button 
                      onClick={() => setProductoAEliminar(prod)}
                      className="btn btn-danger btn-sm"
                      title="Eliminar producto"
                      aria-label={`Eliminar ${prod.nombre}`}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Crear / Editar con FormField y Copilot IA */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={productoEnEdicion ? `Taller & Editor: Editar "${productoEnEdicion.nombre}"` : 'Taller & Editor: Registrar Nuevo Juguete'}
      >
        <form onSubmit={handleSubmit}>
          {formError && <AlertBox type="error" message={formError} onClose={() => setFormError(null)} />}
          {formSuccess && <AlertBox type="success" message={formSuccess} onClose={() => setFormSuccess(null)} />}

          <FormField label="Nombre del Juguete" required>
            <input
              type="text"
              required
              className="input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Set Bloques Castillo Medieval 500 pcs"
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Precio ($ USD)" required>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="input"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="49.99"
              />
            </FormField>
            <FormField label="Stock Inicial" required>
              <input
                type="number"
                min="0"
                required
                className="input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
              />
            </FormField>
          </div>

          <FormField label="Categoría" required>
            <select
              className="select"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              <option value="Construcción">Construcción</option>
              <option value="Muñecas y figuras">Muñecas y figuras</option>
              <option value="Juegos de mesa">Juegos de mesa</option>
              <option value="Peluches">Peluches</option>
              <option value="Arte y manualidades">Arte y manualidades</option>
              <option value="Vehículos y Exterior">Vehículos y Exterior</option>
            </select>
          </FormField>

          <FormField
            label="Descripción Comercial"
            actionButton={
              <button
                type="button"
                onClick={handleGenerarDescripcionIA}
                disabled={generandoIA}
                className="btn btn-outline-primary btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                <Sparkles size={14} />
                {generandoIA ? 'Generando...' : 'Generar con IA (n8n)'}
              </button>
            }
          >
            <textarea
              className="textarea"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción persuasiva y didáctica para la ficha del juguete..."
            />
          </FormField>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <input
              type="checkbox"
              id="activo-check"
              checked={formData.activo === 1}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="activo-check" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Juguete habilitado para la venta en el catálogo
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="btn btn-primary"
            >
              {guardando ? 'Guardando...' : (productoEnEdicion ? 'Actualizar Producto' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={Boolean(productoAEliminar)}
        onClose={() => setProductoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto del inventario?"
        message={`¿Estás seguro de que deseas eliminar "${productoAEliminar?.nombre}"? Si tiene órdenes asociadas pasará a estado inactivo para preservar el historial.`}
        confirmText="Eliminar Producto"
        isDestructive={true}
        loading={eliminando}
      />
    </div>
  );
}
