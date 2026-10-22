import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Share2, 
  Globe, 
  Send, 
  Check, 
  Lock
} from 'lucide-react';

export default function PublicFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer id="contacto" style={{
      backgroundColor: '#FAF7F2',
      borderTop: '1px solid #EBE3D7',
      paddingTop: 56,
      paddingBottom: 28,
      color: '#2F2636'
    }}>
      <div className="container">
        {/* 4 Columnas del Footer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 36,
          marginBottom: 44
        }}>
          {/* Columna 1: Marca */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: '#FDF1F4',
                color: '#DE7B94',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #F7D0DA'
              }}>
                <Sparkles size={18} strokeWidth={2.3} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#2F2636' }}>
                Mundo Juguete
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#665A70', lineHeight: 1.6, marginBottom: 16 }}>
              Diseñamos y curamos juguetes artesanales, ecológicos y respetuosos con el ritmo natural de la niñez. Creer en la curiosidad es cuidar la chispa de lo que seremos mañana.
            </p>

            {/* Redes Sociales en círculos */}
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="#comunidad"
                aria-label="Comunidad en línea"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #EBE3D7',
                  backgroundColor: '#FFFFFF',
                  color: '#665A70',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                <Globe size={15} strokeWidth={2} />
              </a>
              <a
                href="#compartir"
                aria-label="Compartir"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #EBE3D7',
                  backgroundColor: '#FFFFFF',
                  color: '#665A70',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                <Share2 size={15} strokeWidth={2} />
              </a>
              <a
                href="#whatsapp"
                aria-label="Mensaje"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #EBE3D7',
                  backgroundColor: '#FFFFFF',
                  color: '#665A70',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                <Send size={14} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.96rem', fontWeight: 800, marginBottom: 14, color: '#2F2636' }}>
              Explorar
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.84rem' }}>
              <li>
                <Link to="/catalogo" style={{ color: '#665A70', textDecoration: 'none' }}>Colecciones</Link>
              </li>
              <li>
                <Link to="/#historia" style={{ color: '#665A70', textDecoration: 'none' }}>Curiosidades</Link>
              </li>
              <li>
                <Link to="/#beneficios" style={{ color: '#665A70', textDecoration: 'none' }}>Envíos y devoluciones</Link>
              </li>
              <li>
                <Link to="/#beneficios" style={{ color: '#665A70', textDecoration: 'none' }}>Preguntas frecuentes</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al cliente */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.96rem', fontWeight: 800, marginBottom: 14, color: '#2F2636' }}>
              Atención al cliente
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: '#665A70' }}>
              <span>Envíos a todo Costa Rica</span>
              <span>L-V: 9:00 - 18:00 / S: 10:00 - 14:00</span>
              <a href="mailto:hola@mundojuguete.cr" style={{ color: '#665A70', textDecoration: 'none' }}>
                hola@mundojuguete.cr
              </a>
              <span style={{ fontWeight: 700, color: '#2F2636' }}>
                +506 8522-3100
              </span>
            </div>
          </div>

          {/* Columna 4: Cuentos & Novedades (Newsletter) */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.96rem', fontWeight: 800, marginBottom: 14, color: '#2F2636' }}>
              Cuentos & Novedades
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#665A70', lineHeight: 1.5, marginBottom: 12 }}>
              Suscríbete al boletín de las familias tejedoras de historias: juegos en casa, ideas y pequeñas rebajas.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="email"
                required
                placeholder="Tu correo electrónico..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #EBE3D7',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.8rem',
                  color: '#2F2636',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: subscribed ? '#41A07D' : '#DE7B94',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(222, 123, 148, 0.3)'
                }}
              >
                {subscribed ? <Check size={16} /> : 'Suscribirme'}
              </button>
            </form>

            <span style={{ fontSize: '0.72rem', color: '#8F8299' }}>
              No spam, solo ilusión garantizada.
            </span>
          </div>
        </div>

        {/* Barra Inferior */}
        <div style={{
          borderTop: '1px solid #EBE3D7',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.76rem',
          color: '#8F8299'
        }}>
          <div>
            © 2026 Mundo Juguete S.L. Todos los derechos reservados.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>El afecto por amor y madera sostenible</span>
            <Link
              to="/admin"
              style={{
                color: '#8F8299',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Acceso al Área del Personal"
            >
              <Lock size={12} />
              <span>Área del Personal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
