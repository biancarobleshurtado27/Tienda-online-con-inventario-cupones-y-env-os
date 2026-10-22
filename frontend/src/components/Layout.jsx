import React from 'react';
import Navbar from './Navbar.jsx';
import { Truck, Leaf, ShieldCheck, ArrowRight, Package, BookOpen, Clock, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF8F5' }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: 48, paddingTop: 16 }}>
        {children}

        {/* Banner de Envíos del Mockup */}
        <div className="container" style={{ marginTop: 28 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            border: '1px solid #EFE8DF',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 4px 16px rgba(47, 38, 54, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#EDE7F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C55C7',
                flexShrink: 0
              }}>
                <Truck size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  margin: 0,
                  color: '#342639'
                }}>
                  Envíos llenos de ilusión
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#8C8191' }}>
                  Cuidamos cada detalle y empaque con amor artesanal
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', fontWeight: 700, color: '#4A3D52' }}>
                <Leaf size={16} color="#5ECBA1" strokeWidth={2.4} />
                <span>Empaque Ecológico</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', fontWeight: 700, color: '#4A3D52' }}>
                <ShieldCheck size={16} color="#5A9EC4" strokeWidth={2.4} />
                <span>Seguridad Garantizada</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer del Catálogo de Cuento */}
      <footer style={{
        borderTop: '1px solid #EFE8DF',
        padding: '48px 0 24px',
        backgroundColor: '#F7F3EE',
        color: '#6A5E70',
        fontSize: '0.825rem'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 36,
            marginBottom: 40
          }}>
            {/* Columna Marca */}
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#342639',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10
              }}>
                <Sparkles size={20} color="#ED849A" />
                <span>Mundo Juguete</span>
              </div>
              <p style={{ fontSize: '0.825rem', lineHeight: 1.6, color: '#8C8191', maxWidth: 280 }}>
                Un catálogo de cuento donde cada rincón despierta la imaginación y el aprendizaje lúdico.
              </p>
            </div>

            {/* Columna Explorar */}
            <div>
              <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#342639', fontSize: '0.9rem', marginBottom: 14 }}>
                Explorar
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link to="/productos?categoria=Construcción" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowRight size={13} color="#ED849A" /> Colección Montessori
                  </Link>
                </li>
                <li>
                  <Link to="/productos" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowRight size={13} color="#ED849A" /> Juguetes de Madera
                  </Link>
                </li>
                <li>
                  <Link to="/productos" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowRight size={13} color="#ED849A" /> Cuentos & Fábulas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna Administración */}
            <div>
              <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#342639', fontSize: '0.9rem', marginBottom: 14 }}>
                Administración
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link to="/productos" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={14} color="#7C55C7" /> Gestor de Inventario
                  </Link>
                </li>
                <li>
                  <Link to="/ordenes" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={14} color="#5A9EC4" /> Control de Órdenes
                  </Link>
                </li>
                <li>
                  <Link to="/asistente-ia" style={{ color: '#6A5E70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#ED849A" /> Estudio de Creatividad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna Atención Mágica */}
            <div>
              <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#342639', fontSize: '0.9rem', marginBottom: 14 }}>
                Atención Mágica
              </h5>
              <p style={{ margin: '0 0 6px', color: '#8C8191', fontSize: '0.8rem' }}>
                ¿Preguntas sobre un juguete o pedido?
              </p>
              <div style={{ fontWeight: 700, color: '#ED849A', marginBottom: 8 }}>
                hola@mundojuguete.es
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8C8191', fontSize: '0.75rem' }}>
                <Clock size={13} /> Lun - Vie: 9:00 a 18:00
              </div>
            </div>
          </div>

          {/* Subfooter */}
          <div style={{
            borderTop: '1px solid #EFE8DF',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.75rem',
            color: '#A095A6'
          }}>
            <span>© 2025 Mundo Juguete S.L. Todos los derechos reservados.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ cursor: 'pointer' }}>Privacidad</span>
              <span style={{ cursor: 'pointer' }}>Términos de la Cuenta</span>
              <span style={{ cursor: 'pointer' }}>Aviso Legal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
