import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  generarDescripcionIA 
} from '../services/api.js';
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
  AlertCircle
} from 'lucide-react';

const CATEGORIAS = ['Todas', 'Periféricos', 'Audio', 'Monitores', 'Accesorios'];

export default function ProductosPage() {
  const { data: productos = [], loading, error, refetch } = useFetch(getProductos);

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
    categoria: 'Periféricos',
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
      categoria: 'Periféricos',
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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={28} color="#818cf8" />
            Catálogo de Productos
          </h1>
          <p className="page-subtitle">
            Administración completa de inventario, precios y categorización con IA.
          </p>
        </div>
        <button onClick={handleOpenCrear} className="btn btn-primary">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {error && <AlertBox type="error" message={error} />}
      {pageError && <AlertBox type="error" message={pageError} onClose={() => setPageError(null)} />}
      {pageSuccess && <AlertBox type="success" message={pageSuccess} onClose={() => setPageSuccess(null)} />}

      {/* Barra de Filtros, Búsqueda y Orden */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
        <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Mostrando {productosFiltrados.length} de {productos.length} productos</span>
          {(busqueda || categoriaSeleccionada !== 'Todas') && (
            <button
              onClick={() => { setBusqueda(''); setCategoriaSeleccionada('Todas'); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de Productos o Estado de Carga */}
      {loading ? (
        <LoadingState message="Cargando catálogo de productos desde el backend..." />
      ) : productosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No se encontraron productos</h3>
          <p style={{ marginTop: 6, fontSize: '0.9rem' }}>Intenta ajustar los criterios de búsqueda o agrega uno nuevo.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 20
        }}>
          {productosFiltrados.map((prod) => (
            <div 
              key={prod.id} 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: 'var(--bg-subtle)',
                    color: '#818cf8',
                    border: '1px solid var(--border-color)'
                  }}>
                    {prod.categoria}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: prod.stock > 5 ? 'var(--success)' : (prod.stock > 0 ? 'var(--warning)' : 'var(--danger)'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {prod.stock > 0 ? `${prod.stock} en stock` : 'Agotado'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                  {prod.nombre}
                </h3>

                <p style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.45
                }}>
                  {prod.descripcion || 'Sin descripción comercial registrada.'}
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
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
                    ${prod.precio.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: prod.activo ? 'var(--success)' : 'var(--text-subtle)' }}>
                    {prod.activo ? '● Activo para venta' : '○ Inactivo'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleOpenEditar(prod)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Edit3 size={15} /> Editar
                  </button>
                  <button 
                    onClick={() => setProductoAEliminar(prod)}
                    className="btn btn-danger btn-sm"
                    title="Eliminar producto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar con FormField y Copilot IA */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={productoEnEdicion ? `Editar Producto: ${productoEnEdicion.nombre}` : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          {formError && <AlertBox type="error" message={formError} onClose={() => setFormError(null)} />}
          {formSuccess && <AlertBox type="success" message={formSuccess} onClose={() => setFormSuccess(null)} />}

          <FormField label="Nombre del Producto" required>
            <input
              type="text"
              required
              className="input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Teclado Mecánico RGB Switch Red"
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
              <option value="Periféricos">Periféricos</option>
              <option value="Audio">Audio</option>
              <option value="Monitores">Monitores</option>
              <option value="Accesorios">Accesorios</option>
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
                {generandoIA ? 'Generando...' : 'Generar con IA'}
              </button>
            }
          >
            <textarea
              className="textarea"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción persuasiva para la ficha de producto..."
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
              Producto habilitado para la venta en el catálogo
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
