import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px' }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Ocurrió un error al cargar la vista</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              {this.state.error?.message || 'Error inesperado de renderizado.'}
            </p>
            <button onClick={this.handleReload} className="btn btn-primary" style={{ margin: '0 auto' }}>
              <RefreshCw size={16} /> Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
