import React from 'react';
import { Inbox } from 'lucide-react';

export default function TableList({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id || index,
  renderRow,
  emptyMessage = 'No se encontraron registros para mostrar.',
  emptyTitle = 'Sin resultados',
  emptyIcon: EmptyIcon = Inbox
}) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
        <EmptyIcon size={44} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--text-subtle)' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>{emptyTitle}</h4>
        <p style={{ fontSize: '0.875rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '14px 20px',
                    fontWeight: 700,
                    textAlign: col.align || 'left',
                    width: col.width || 'auto'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                style={{
                  borderBottom: index < data.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
