import React from 'react';

export default function FormField({
  label,
  required = false,
  error = null,
  helpText = null,
  children,
  actionButton = null,
  style = {}
}) {
  return (
    <div className="form-group" style={{ marginBottom: 16, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {label && (
          <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
          </label>
        )}
        {actionButton}
      </div>

      {children}

      {helpText && !error && (
        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 4 }}>
          {helpText}
        </span>
      )}

      {error && (
        <span style={{ display: 'block', fontSize: '0.775rem', color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}
