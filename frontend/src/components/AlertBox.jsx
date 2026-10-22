import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function AlertBox({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'var(--pastel-berry-light)',
      border: 'rgba(207, 75, 108, 0.3)',
      text: 'var(--pastel-berry-text)',
      icon: AlertCircle,
    },
    success: {
      bg: 'var(--pastel-mint-light)',
      border: 'rgba(65, 160, 125, 0.3)',
      text: 'var(--pastel-mint-text)',
      icon: CheckCircle,
    },
    info: {
      bg: 'var(--pastel-sky-light)',
      border: 'rgba(90, 158, 196, 0.3)',
      text: 'var(--pastel-sky-text)',
      icon: Info,
    },
    warning: {
      bg: 'var(--pastel-butter-light)',
      border: 'rgba(214, 164, 41, 0.3)',
      text: 'var(--pastel-butter-text)',
      icon: AlertTriangle,
    },
  };

  const current = styles[type] || styles.error;
  const Icon = current.icon;

  return (
    <div style={{
      backgroundColor: current.bg,
      border: `1px solid ${current.border}`,
      color: current.text,
      padding: '12px 18px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
      fontSize: '0.875rem',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(47, 38, 54, 0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={19} strokeWidth={2.2} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar notificación"
          style={{
            background: 'none',
            border: 'none',
            color: current.text,
            cursor: 'pointer',
            padding: 4,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
