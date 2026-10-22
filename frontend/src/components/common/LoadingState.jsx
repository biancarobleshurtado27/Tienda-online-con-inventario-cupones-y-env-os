import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingState({ message = 'Cargando maravillas de Mundo Juguete...', height = '280px' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: height,
      color: 'var(--text-muted)',
      gap: 14,
      padding: '32px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: 'var(--pastel-lavender-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(142, 116, 190, 0.15)'
      }}>
        <Loader2 size={28} style={{ color: 'var(--pastel-lavender)', animation: 'spin 1.2s linear infinite' }} />
        <Sparkles size={14} style={{ position: 'absolute', top: 2, right: 2, color: 'var(--pastel-butter)' }} />
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{message}</p>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Conectando con el taller en vivo</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
