import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function AlertBox({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#fca5a5',
      icon: AlertCircle,
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#6ee7b7',
      icon: CheckCircle,
    },
    info: {
      bg: 'rgba(14, 165, 233, 0.12)',
      border: 'rgba(14, 165, 233, 0.3)',
      text: '#7dd3fc',
      icon: Info,
    },
  };

  const current = styles[type] || styles.error;
  const Icon = current.icon;

  return (
    <div style={{
      backgroundColor: current.bg,
      border: `1px solid ${current.border}`,
      color: current.text,
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
      fontSize: '0.875rem',
      fontWeight: 500,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: current.text,
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
