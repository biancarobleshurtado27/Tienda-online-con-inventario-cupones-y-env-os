import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorState({ 
  title = 'Ocurrió un inconveniente', 
  message = 'No se pudo cargar la información requerida.', 
  onRetry = null,
  showHome = false 
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--pastel-berry-border)',
      padding: '36px 24px',
      textAlign: 'center',
      maxWidth: 540,
      margin: '32px auto',
      boxShadow: '0 8px 24px rgba(207, 86, 99, 0.06)'
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: 'var(--pastel-berry-light)',
        color: 'var(--pastel-berry)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <AlertCircle size={32} strokeWidth={2.2} />
      </div>

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        marginBottom: 8
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        marginBottom: 20
      }}>
        {message}
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={16} strokeWidth={2} /> Reintentar
          </button>
        )}
        {showHome && (
          <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Home size={16} strokeWidth={2} /> Volver al Inicio
          </Link>
        )}
      </div>
    </div>
  );
}
