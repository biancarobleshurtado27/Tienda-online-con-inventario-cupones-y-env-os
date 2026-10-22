import React from 'react';
import Modal from './Modal.jsx';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas realizar esta acción? Esta operación puede no ser reversible.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDestructive ? 'var(--danger)' : 'var(--warning)',
          flexShrink: 0
        }}>
          {isDestructive ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.925rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn btn-secondary"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={isDestructive ? 'btn btn-danger' : 'btn btn-primary'}
        >
          {loading ? 'Procesando...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
