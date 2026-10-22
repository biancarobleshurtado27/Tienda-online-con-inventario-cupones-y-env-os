import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  UserPlus, 
  User, 
  Mail, 
  MapPin, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const CIUDADES_COSTA_RICA = [
  'San José',
  'Heredia',
  'Alajuela',
  'Cartago',
  'Puntarenas',
  'Guanacaste',
  'Limón'
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    ciudad: 'San José',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación controlada en el cliente
    if (!formData.nombre.trim()) {
      setError('Por favor indica tu nombre completo.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Por favor introduce un correo electrónico válido.');
      return;
    }

    if (!formData.ciudad) {
      setError('Por favor selecciona tu ciudad de residencia para el cálculo de envíos.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        ciudad: formData.ciudad,
        password: formData.password
      });

      // El registro fue exitoso y la cookie httpOnly ya está configurada
      navigate('/mi-cuenta');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Por favor intenta nuevamente.');
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
        maxWidth: 520,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: '36px 32px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 40px rgba(47, 38, 54, 0.05)'
      }}>
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: 'var(--pastel-rose-light)',
            color: 'var(--pastel-rose-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(222, 123, 148, 0.2)'
          }}>
            <UserPlus size={22} strokeWidth={2.3} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            color: 'var(--text-main)',
            fontWeight: 800,
            marginBottom: 6
          }}>
            Crear cuenta de cliente
          </h1>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-muted)'
          }}>
            Regístrate para guardar tu carrito, recibir juguetes mágicos y consultar tus órdenes.
          </p>
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

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Nombre completo
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                name="nombre"
                required
                placeholder="Ej. Sofía Jiménez"
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="email"
                name="email"
                required
                placeholder="sofia@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Ciudad */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Ciudad / Provincia (para cálculo de envíos)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                {CIUDADES_COSTA_RICA.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Contraseña (mínimo 6 caracteres)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="password"
                name="password"
                required
                placeholder="Crea una contraseña segura"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Confirmar contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Vuelve a escribir la contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FAF7F2',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
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
              backgroundColor: 'var(--pastel-rose)',
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(222, 123, 148, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creando tu cuenta...</span>
              </>
            ) : (
              <>
                <span>Registrarme como cliente</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-muted)'
        }}>
          <span>¿Ya tienes una cuenta? </span>
          <Link
            to="/iniciar-sesion"
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
