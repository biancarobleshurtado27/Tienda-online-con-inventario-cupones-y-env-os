import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Lock
} from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-color)',
      paddingTop: 56,
      paddingBottom: 32,
      marginTop: 48,
      position: 'relative'
    }}>
      <div className="container">
        {/* Banner Superior de Garantías Suaves */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '28px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          marginBottom: 48
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-lavender-light)',
              color: 'var(--pastel-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Envíos Cuidados</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Empaque artesanal a toda la ciudad</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-mint-light)',
              color: 'var(--pastel-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Seguridad Garantizada</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Juguetes seguros y no tóxicos</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-rose-light)',
              color: 'var(--pastel-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Hecho con Ilusión</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inspirando juego libre sin pantallas</p>
            </div>
          </div>
        </div>

        {/* Columnas Principales del Footer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 36,
          marginBottom: 48
        }}>
          {/* Columna 1: Marca y Propósito */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'var(--pastel-lavender-light)',
                color: 'var(--pastel-lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} strokeWidth={2.3} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Mundo Juguete
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              La juguetería de cuento donde cada rincón inspira creatividad, juego cooperativo y sonrisas infantiles para toda la vida.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color="var(--pastel-lavender)" /> San José, Costa Rica
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} color="var(--pastel-lavender)" /> Lunes a Sábado: 9:00 AM - 6:30 PM
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Mail size={15} color="var(--pastel-lavender)" /> hola@mundojuguete.cr
              </span>
            </div>
          </div>

          {/* Columna 2: Navegación de Clientes */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
              Exploración
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inicio</Link>
              </li>
              <li>
                <Link to="/catalogo" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/carrito" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Carrito Mágico</Link>
              </li>
              <li>
                <Link to="/#historia" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Nuestra Historia</Link>
              </li>
              <li>
                <Link to="/#beneficios" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Beneficios y Envíos</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Categorías */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
              Mundos Creativos
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem' }}>
              <li>
                <Link to="/catalogo?categoria=Construcción" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Construcción & Bloques</Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Muñecas y figuras" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Muñecas & Figuras</Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Juegos de mesa" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Juegos de Mesa Familiares</Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Peluches" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Peluches & Abrazos</Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Arte y manualidades" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Arte & Pintura Infantil</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior con Derechos y Acceso Discreto al Personal */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: '0.8rem',
          color: 'var(--text-subtle)'
        }}>
          <div>
            © {new Date().getFullYear()} Mundo Juguete. Todos los derechos reservados.
          </div>

          {/* Acceso discreto para el personal del taller */}
          <div>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--text-subtle)',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: '0.78rem',
                border: '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-subtle)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Panel de administración y gestión interna"
            >
              <Lock size={12} strokeWidth={2} />
              <span>Área del Personal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
