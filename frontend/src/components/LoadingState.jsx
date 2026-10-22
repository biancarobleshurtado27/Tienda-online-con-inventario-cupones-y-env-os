import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Cargando información desde el servidor...', height = '300px' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: height,
      color: 'var(--text-muted)',
      gap: 14
    }}>
      <Loader2 size={36} className="spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '0.925rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
