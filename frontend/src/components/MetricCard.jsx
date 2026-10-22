import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.25)',
      icon: '#818cf8',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)',
      icon: '#34d399',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)',
      icon: '#fbbf24',
    },
    info: {
      bg: 'rgba(14, 165, 233, 0.1)',
      border: 'rgba(14, 165, 233, 0.25)',
      icon: '#38bdf8',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em', color: '#ffffff' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.icon,
          flexShrink: 0
        }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
}
