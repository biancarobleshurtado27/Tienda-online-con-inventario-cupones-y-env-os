import React, { useState } from 'react';
import { generarDescripcionIA, recomendarCarritoIA } from '../services/api.js';
import AlertBox from '../components/AlertBox.jsx';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Copy, 
  Check, 
  ShoppingBag, 
  Layers, 
  Code, 
  Cpu
} from 'lucide-react';

export default function AsistenteIAPage() {
  // Pestaña activa: 'descripcion' | 'recomendador'
  const [tabActiva, setTabActiva] = useState('descripcion');

  // Estado para generador de descripción
  const [descNombre, setDescNombre] = useState('Set Bloques Castillo Medieval 500 pcs');
  const [descCategoria, setDescCategoria] = useState('Construcción');
  const [cargandoDesc, setCargandoDesc] = useState(false);
  const [resultadoDesc, setResultadoDesc] = useState(null);
  const [copiadoDesc, setCopiadoDesc] = useState(false);

  // Estado para recomendador
  const [productosSeleccionados, setProductosSeleccionados] = useState([1, 2]); // IDs de ejemplo
  const [cargandoRecom, setCargandoRecom] = useState(false);
  const [resultadoRecom, setResultadoRecom] = useState(null);

  // Feedback general
  const [errorMsg, setErrorMsg] = useState(null);

  // Generar descripción
  const handleGenerarDescripcion = async (e) => {
    e.preventDefault();
    if (!descNombre.trim()) {
      setErrorMsg('Ingresa el nombre del juguete.');
      return;
    }

    setCargandoDesc(true);
    setErrorMsg(null);
    try {
      const resp = await generarDescripcionIA(descNombre.trim(), descCategoria);
      setResultadoDesc(resp);
    } catch (err) {
      setErrorMsg(`Error al consultar agente de IA: ${err.message}`);
    } finally {
      setCargandoDesc(false);
    }
  };

  // Recomendar productos
  const handleRecomendar = async () => {
    setCargandoRecom(true);
    setErrorMsg(null);
    try {
      const resp = await recomendarCarritoIA(productosSeleccionados);
      setResultadoRecom(resp);
    } catch (err) {
      setErrorMsg(`Error al obtener recomendaciones de IA: ${err.message}`);
    } finally {
      setCargandoRecom(false);
    }
  };

  const handleCopiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    setCopiadoDesc(true);
    setTimeout(() => setCopiadoDesc(false), 2000);
  };

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={28} color="#c084fc" />
            Asistente Copilot IA & n8n
          </h1>
          <p className="page-subtitle">
            Integración de Mundo Juguete con Agente de IA en n8n bajo el contrato formal <code>&#123; ok, data, error &#125;</code>.
          </p>
        </div>
      </div>

      {errorMsg && <AlertBox type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        <button
          onClick={() => setTabActiva('descripcion')}
          className="btn"
          style={{
            backgroundColor: tabActiva === 'descripcion' ? 'var(--primary-light)' : 'transparent',
            color: tabActiva === 'descripcion' ? '#818cf8' : 'var(--text-muted)',
            borderColor: tabActiva === 'descripcion' ? 'var(--primary)' : 'transparent'
          }}
        >
          <Bot size={16} /> 1. Generador de Descripción Comercial
        </button>
        <button
          onClick={() => setTabActiva('recomendador')}
          className="btn"
          style={{
            backgroundColor: tabActiva === 'recomendador' ? 'var(--primary-light)' : 'transparent',
            color: tabActiva === 'recomendador' ? '#818cf8' : 'var(--text-muted)',
            borderColor: tabActiva === 'recomendador' ? 'var(--primary)' : 'transparent'
          }}
        >
          <ShoppingBag size={16} /> 2. Recomendador de Carrito de Juguetes
        </button>
      </div>

      {/* Contenido Tab 1: Generador de Descripción */}
      {tabActiva === 'descripcion' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24
        }}>
          {/* Formulario */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={20} color="var(--primary)" />
              Parámetros del Juguete
            </h3>

            <form onSubmit={handleGenerarDescripcion}>
              <div className="form-group">
                <label className="form-label">Nombre del Juguete</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={descNombre}
                  onChange={(e) => setDescNombre(e.target.value)}
                  placeholder="Ej. Muñeca Articulada Aventurera con Accesorios"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría del Juguete</label>
                <select
                  className="select"
                  value={descCategoria}
                  onChange={(e) => setDescCategoria(e.target.value)}
                >
                  <option value="Construcción">Construcción</option>
                  <option value="Muñecas y figuras">Muñecas y figuras</option>
                  <option value="Juegos de mesa">Juegos de mesa</option>
                  <option value="Peluches">Peluches</option>
                  <option value="Arte y manualidades">Arte y manualidades</option>
                  <option value="Vehículos y Exterior">Vehículos y Exterior</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={cargandoDesc}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10 }}
              >
                <Sparkles size={16} />
                {cargandoDesc ? 'Consultando AI Agent en n8n...' : 'Generar Redacción Comercial'}
              </button>
            </form>
          </div>

          {/* Resultado de la IA */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={20} color="#34d399" />
                  Respuesta del Agente de IA
                </h3>
                {resultadoDesc?.data?.fuente && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Fuente: {resultadoDesc.data.fuente}
                  </span>
                )}
              </div>

              {resultadoDesc ? (
                <div>
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'white',
                    marginBottom: 16
                  }}>
                    {resultadoDesc.data?.descripcion_generada}
                  </div>

                  <button
                    onClick={() => handleCopiarTexto(resultadoDesc.data?.descripcion_generada)}
                    className="btn btn-secondary btn-sm"
                  >
                    {copiadoDesc ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    {copiadoDesc ? '¡Copiado al portapapeles!' : 'Copiar Descripción'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                  <Sparkles size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.875rem' }}>
                    Envía el formulario para obtener un copy publicitario redactado por IA.
                  </p>
                </div>
              )}
            </div>

            {/* Inspección de Contrato JSON */}
            {resultadoDesc && (
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Code size={12} /> Contrato de Respuesta: &#123; ok: true, data: ..., error: null &#125;
                </div>
                <pre style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: 10,
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: '#a5b4fc',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {JSON.stringify(resultadoDesc, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido Tab 2: Recomendador de Carrito */}
      {tabActiva === 'recomendador' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24
        }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} color="var(--primary)" />
              Simular Juguetes en el Carrito
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              El agente de IA en n8n analiza las afinidades temáticas de Mundo Juguete y las edades recomendadas para sugerir complementos ideales.
            </p>

            <button
              onClick={handleRecomendar}
              disabled={cargandoRecom}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Sparkles size={16} />
              {cargandoRecom ? 'Generando sugerencias con IA...' : 'Analizar Carrito y Recomendar'}
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="#fbbf24" />
              Sugerencias de Venta Cruzada
            </h3>

            {resultadoRecom ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {resultadoRecom.data?.mensaje}
                </p>

                {(resultadoRecom.data?.recomendaciones || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.motivo}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem' }}>
                      ${item.precio.toFixed(2)}
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 14, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <pre style={{
                    backgroundColor: 'var(--bg-main)',
                    padding: 8,
                    borderRadius: 6,
                    fontSize: '0.725rem',
                    color: '#a5b4fc',
                    overflowX: 'auto',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {JSON.stringify(resultadoRecom, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                <ShoppingBag size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>
                  Haz clic en "Analizar Carrito" para probar el motor de recomendaciones.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
