import React from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No encontramos resultados',
  description = 'Intenta ajustar tus filtros o buscar con otros términos.',
  actionText = null,
  actionTo = null,
  onAction = null
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '48px 24px',
      textAlign: 'center',
      maxWidth: 520,
      margin: '24px auto',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: 'var(--pastel-lavender-light)',
        color: 'var(--pastel-lavender)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Icon size={32} strokeWidth={2} />
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
        lineHeight: 1.55,
        marginBottom: (actionText && (actionTo || onAction)) ? 22 : 0
      }}>
        {description}
      </p>

      {actionText && actionTo && (
        <Link 
          to={actionTo} 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <Sparkles size={16} strokeWidth={2.2} /> {actionText}
        </Link>
      )}

      {actionText && !actionTo && onAction && (
        <button 
          onClick={onAction} 
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
