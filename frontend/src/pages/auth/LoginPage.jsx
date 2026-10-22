import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('cliente'); // 'cliente' | 'personal'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect');

  // Rellenar credenciales demo para facilitar la revisión
  const fillDemoCredentials = (role) => {
    setError(null);
    if (role === 'personal') {
      setActiveTab('personal');
      setEmail('personal@mundojuguete.cr');
      setPassword('Password123!');
    } else {
      setActiveTab('cliente');
      setEmail('carlos.mora@example.com');
      setPassword('Password123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const usuario = await login(email.trim(), password);

      // Redirección inteligente según el rol autenticado
      if (usuario.rol === 'personal') {
        navigate(redirectUrl && redirectUrl.startsWith('/admin') ? redirectUrl : '/admin/dashboard');
      } else {
        navigate(redirectUrl && !redirectUrl.startsWith('/admin') ? redirectUrl : '/mi-cuenta');
      }
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: '36px 32px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 40px rgba(47, 38, 54, 0.05)'
      }}>
        {/* Cabecera decorativa de Nube de algodón */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: activeTab === 'cliente' ? 'var(--pastel-rose-light)' : 'var(--pastel-lavender-light)',
            color: activeTab === 'cliente' ? 'var(--pastel-rose-text)' : 'var(--pastel-lavender-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(47, 38, 54, 0.05)',
            transition: 'all 0.25s ease'
          }}>
            {activeTab === 'cliente' ? (
              <ShoppingBag size={22} strokeWidth={2.3} />
            ) : (
              <ShieldCheck size={22} strokeWidth={2.3} />
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            color: 'var(--text-main)',
            fontWeight: 800,
            marginBottom: 6
          }}>
            Iniciar sesión
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-muted)'
          }}>
            Bienvenido a Mundo Juguete. Selecciona tu tipo de acceso.
          </p>
        </div>

        {/* Dos opciones visuales de acceso */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          backgroundColor: '#FAF7F2',
          padding: 6,
          borderRadius: 16,
          marginBottom: 20,
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('cliente'); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: activeTab === 'cliente' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'cliente' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'cliente' ? '0 2px 8px rgba(47, 38, 54, 0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={15} />
            <span>Soy cliente</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('personal'); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: activeTab === 'personal' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'personal' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'personal' ? '0 2px 8px rgba(47, 38, 54, 0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={15} />
            <span>Soy personal</span>
          </button>
        </div>

        {/* Explicación clara del destino según selección */}
        <div style={{
          backgroundColor: activeTab === 'cliente' ? '#FFF9F6' : '#F6F3FA',
          border: `1px solid ${activeTab === 'cliente' ? 'rgba(237, 132, 154, 0.3)' : 'rgba(142, 116, 190, 0.3)'}`,
          padding: '12px 14px',
          borderRadius: 14,
          fontSize: '0.8rem',
          lineHeight: 1.45,
          color: 'var(--text-main)',
          marginBottom: 20
        }}>
          {activeTab === 'cliente' ? (
            <div>
              <strong>Destino de cliente:</strong> Accederás a tu carrito de compras, catálogo público, seguimiento de pedidos personales e historial de tus propias órdenes.
            </div>
          ) : (
            <div>
              <strong>Destino de personal:</strong> Accederás al panel de administración interna, métricas de ventas, gestión de inventario, catálogo general y procesamiento de todas las órdenes.
            </div>
          )}
        </div>

        {/* Mensaje de error controlado */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            backgroundColor: '#FFF1F2',
            border: '1px solid #FFE4E6',
            color: '#BE123C',
            padding: '12px 14px',
            borderRadius: 14,
            fontSize: '0.82rem',
            marginBottom: 20,
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 6
            }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)'
              }} />
              <input
                type="email"
                required
                placeholder={activeTab === 'cliente' ? 'ejemplo@correo.com' : 'personal@mundojuguete.cr'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.backgroundColor = '#FFFFFF'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.backgroundColor = '#FAF7F2'; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 6
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)'
              }} />
              <input
                type="password"
                required
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.backgroundColor = '#FFFFFF'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.backgroundColor = '#FAF7F2'; }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 46,
              borderRadius: 9999,
              border: 'none',
              backgroundColor: activeTab === 'cliente' ? 'var(--pastel-rose)' : 'var(--pastel-lavender)',
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: activeTab === 'cliente' ? '0 4px 14px rgba(222, 123, 148, 0.35)' : '0 4px 14px rgba(142, 116, 190, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <span>Entrar a {activeTab === 'cliente' ? 'mi cuenta de cliente' : 'panel del personal'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Cuentas Demo de Desarrollo */}
        <div style={{
          marginTop: 24,
          padding: '14px',
          backgroundColor: '#FAF7F2',
          borderRadius: 16,
          border: '1px dashed var(--border-color)',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            <KeyRound size={13} />
            <span>Cuentas de prueba para desarrollo:</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('cliente')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: '0.74rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cargar demo cliente (Carlos Mora)
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('personal')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: '0.74rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cargar demo personal (Admin Tienda)
            </button>
          </div>
        </div>

        {/* Enlace a Registro (solo para clientes) */}
        <div style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-muted)'
        }}>
          <span>¿Eres un nuevo cliente? </span>
          <Link
            to="/registro"
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Crea tu cuenta aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
