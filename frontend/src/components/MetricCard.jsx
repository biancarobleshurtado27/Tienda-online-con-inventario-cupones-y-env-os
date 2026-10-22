import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: {
      bg: 'var(--pastel-lavender-light)',
      border: 'rgba(142, 116, 190, 0.25)',
      icon: 'var(--pastel-lavender-text)',
    },
    success: {
      bg: 'var(--pastel-mint-light)',
      border: 'rgba(65, 160, 125, 0.25)',
      icon: 'var(--pastel-mint-text)',
    },
    warning: {
      bg: 'var(--pastel-butter-light)',
      border: 'rgba(214, 164, 41, 0.3)',
      icon: 'var(--pastel-butter-text)',
    },
    info: {
      bg: 'var(--pastel-sky-light)',
      border: 'rgba(90, 158, 196, 0.25)',
      icon: 'var(--pastel-sky-text)',
    },
    rose: {
      bg: 'var(--pastel-rose-light)',
      border: 'rgba(222, 123, 148, 0.25)',
      icon: 'var(--pastel-rose-text)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.95rem',
          fontWeight: 800,
          marginTop: 4,
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.icon,
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(47, 38, 54, 0.04)'
        }}>
          <Icon size={26} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
}
