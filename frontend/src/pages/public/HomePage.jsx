import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { getProductos } from '../../services/api.js';
import ProductCard from '../../components/public/ProductCard.jsx';
import CategoryCard from '../../components/public/CategoryCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  RefreshCw, 
  Gift, 
  MessageCircle, 
  Check, 
  Moon, 
  Star,
  Cloud
} from 'lucide-react';

const CATEGORIAS_DESTACADAS = [
  'Construcción',
  'Muñecas y figuras',
  'Juegos de mesa',
  'Peluches',
  'Arte y manualidades',
  'Vehículos y Exterior'
];

export default function HomePage() {
  const { data: productosData, loading, error, refetch } = useFetch(getProductos, [], []);
  const productos = useMemo(() => (Array.isArray(productosData) ? productosData : []), [productosData]);

  // Selección de 4 productos favoritos para regalar (primeros 4 del seed)
  const favoritos = useMemo(() => {
    return productos
      .filter(p => p.activo)
      .slice(0, 4);
  }, [productos]);

  return (
    <div className="fade-in">
      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section style={{
        paddingTop: 52,
        paddingBottom: 40,
        backgroundColor: '#FAF7F2',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div className="container">
          {/* Tag superior en píldora rosa */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 16px',
            borderRadius: 9999,
            backgroundColor: '#FDF1F4',
            border: '1px solid #F7D0DA',
            color: '#DE7B94',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: 20
          }}>
            <Sparkles size={14} strokeWidth={2.4} />
            <span>Juguetes con encanto & hechos con amor</span>
          </div>

          {/* Título Principal */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.3rem, 4.6vw, 3.4rem)',
            fontWeight: 800,
            color: '#2F2636',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            maxWidth: 820,
            margin: '0 auto 16px'
          }}>
            Juguetes para imaginar historias enormes
          </h1>

          {/* Descripción */}
          <p style={{
            fontSize: 'clamp(0.96rem, 1.8vw, 1.1rem)',
            color: '#665A70',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 28px'
          }}>
            Diseñamos y seleccionamos piezas para el juego libre, madera noble y ternura delicada que acompañan la curiosidad natural, acompañando la infancia paso a paso.
          </p>

          {/* Botones de Acción */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 28
          }}>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 9999,
                backgroundColor: '#DE7B94',
                color: '#FFFFFF',
                fontSize: '0.94rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(222, 123, 148, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>

            <a
              href="#historia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 9999,
                backgroundColor: '#FFFFFF',
                color: '#2F2636',
                fontSize: '0.94rem',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid #EBE3D7',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Conocer nuestra historia</span>
            </a>
          </div>

          {/* Fila de Insignias de Confianza */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 28,
            fontSize: '0.82rem',
            color: '#665A70',
            fontWeight: 700,
            marginBottom: 44
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Heart size={15} color="#DE7B94" strokeWidth={2.3} /> +12,400 familias felices
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#41A07D" strokeWidth={2.3} /> Materiales nobles sin tóxicos
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Truck size={16} color="#8E74BE" strokeWidth={2.3} /> Envíos protegidos 24/48h
            </span>
          </div>

          {/* Gran Imagen Banner de Habitación de Cuento */}
          <div style={{
            maxWidth: 1040,
            margin: '0 auto',
            borderRadius: 28,
            overflow: 'hidden',
            border: '1px solid #EBE3D7',
            boxShadow: '0 14px 40px rgba(120, 95, 130, 0.08)',
            position: 'relative',
            backgroundColor: '#F5EFE6'
          }}>
            <img
              src="/images/hero-toy-nursery.jpg"
              alt="Habitación mágica con juguetes de madera, arcoíris y osito de peluche"
              style={{
                width: '100%',
                maxHeight: 520,
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Badges Flotantes en la parte inferior de la imagen */}
            <div style={{
              position: 'absolute',
              bottom: 18,
              left: 20,
              right: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              pointerEvents: 'none'
            }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'rgba(47, 38, 54, 0.72)',
                backdropFilter: 'blur(6px)',
                padding: '6px 14px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Colección Artesanal de Cuento
              </span>

              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'rgba(47, 38, 54, 0.72)',
                backdropFilter: 'blur(6px)',
                padding: '6px 14px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Pinturas al agua y madera FSC 100% certificada
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SECCIÓN: RINCONES PARA CADA TIPO DE JUEGO (CATEGORÍAS)
          ======================================================== */}
      <section style={{ padding: '72px 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          {/* Cabecera de Categorías */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 36
          }}>
            <div style={{ maxWidth: 660 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 9999,
                backgroundColor: '#F3EFFB',
                color: '#8E74BE',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginBottom: 10
              }}>
                <Sparkles size={13} strokeWidth={2.4} />
                <span>Explorar mundos</span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#2F2636',
                margin: '0 0 8px'
              }}>
                Rincones para cada tipo de juego
              </h2>

              <p style={{ fontSize: '0.92rem', color: '#665A70', margin: 0, lineHeight: 1.55 }}>
                Cada rincón estimula una experiencia única en torno a una habilidad natural: orden, motricidad, concentración y juego cooperativo.
              </p>
            </div>

            <Link
              to="/catalogo"
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#2F2636',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Ver todos los mundos</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </Link>
          </div>

          {/* Grid de 6 Categorías */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 20
          }}>
            {CATEGORIAS_DESTACADAS.map((catNombre) => (
              <CategoryCard key={catNombre} nombre={catNombre} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECCIÓN: FAVORITOS PARA REGALAR (PRODUCTOS)
          ======================================================== */}
      <section style={{ padding: '64px 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 9999,
              backgroundColor: '#FDF1F4',
              color: '#DE7B94',
              fontSize: '0.74rem',
              fontWeight: 800,
              marginBottom: 10
            }}>
              <Sparkles size={13} strokeWidth={2.4} />
              <span>Curaduría especial</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#2F2636',
              margin: '0 0 8px'
            }}>
              Favoritos para regalar
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#665A70', maxWidth: 600, margin: '0 auto' }}>
              Las piezas más celebradas por familias exploradoras y recomendadas con devoción por educadores respetuosos.
            </p>
          </div>

          {loading ? (
            <LoadingState message="Cargando favoritos de Mundo Juguete..." />
          ) : error ? (
            <ErrorState title="Error al cargar productos" message={error} onRetry={refetch} />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 20
            }}>
              {favoritos.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. SECCIÓN: 4 BENEFICIOS (BARRA HORIZONTAL BLANCA)
          ======================================================== */}
      <section style={{ padding: '40px 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #EBE3D7',
            padding: '36px 32px',
            boxShadow: '0 4px 20px rgba(120, 95, 130, 0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 28
          }}>
            {/* Beneficio 1 */}
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#FDF1F4',
                color: '#DE7B94',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <MapPin size={22} strokeWidth={2.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#2F2636', marginBottom: 6 }}>
                Envíos según tu Ciudad
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#665A70', lineHeight: 1.55, margin: 0 }}>
                Entregas en 24/48h para todas las principales provincias con empaque artesanal y seguimiento en vivo hasta tu puerta.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#F3EFFB',
                color: '#8E74BE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <RefreshCw size={20} strokeWidth={2.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#2F2636', marginBottom: 6 }}>
                Inventario siempre al día
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#665A70', lineHeight: 1.55, margin: 0 }}>
                Disponibilidad real con conteo minucioso para que nunca te lleves sorpresas y almacén central.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#FFF8E6',
                color: '#D6A429',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <Gift size={22} strokeWidth={2.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#2F2636', marginBottom: 6 }}>
                Cupones de bienvenida e ilusión
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#665A70', lineHeight: 1.55, margin: 0 }}>
                Descuentos especiales para familias suscriptoras y pequeños detalles sorpresa en cada entrega.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#EDF6FC',
                color: '#5A9EC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <MessageCircle size={22} strokeWidth={2.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#2F2636', marginBottom: 6 }}>
                Atención cercana y humana
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#665A70', lineHeight: 1.55, margin: 0 }}>
                Asesoría cariñosa por especialistas en juego consciente para elegir juguetes según la etapa evolutiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECCIÓN: NUESTRA HISTORIA / MANIFIESTO
          ======================================================== */}
      <section id="historia" style={{ padding: '72px 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 48,
            alignItems: 'center'
          }}>
            {/* Foto del taller artesanal con etiqueta flotante */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid #EBE3D7',
                boxShadow: '0 12px 32px rgba(120, 95, 130, 0.08)'
              }}>
                <img
                  src="/images/artisan-toy-workshop.jpg"
                  alt="Taller y tienda artesanal de madera con madre e hija sonriendo"
                  style={{
                    width: '100%',
                    height: 420,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              {/* Badge flotante "Desde 2016" */}
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: '10px 18px',
                border: '1px solid #EBE3D7',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 800, color: '#2F2636' }}>
                  Desde 2016
                </div>
                <div style={{ fontSize: '0.74rem', color: '#665A70' }}>
                  Fabricando sonrisas honestas
                </div>
              </div>
            </div>

            {/* Texto de la Historia */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 9999,
                backgroundColor: '#FDF1F4',
                color: '#DE7B94',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginBottom: 12
              }}>
                <Heart size={13} strokeWidth={2.4} />
                <span>Historias que nos inspiran</span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#2F2636',
                lineHeight: 1.25,
                marginBottom: 16
              }}>
                Creemos en el poder transformador del juego simple y honesto
              </h2>

              <p style={{ fontSize: '0.92rem', color: '#665A70', lineHeight: 1.65, marginBottom: 14 }}>
                Mundo Juguete nació con un pequeño taller de barrio con una convicción clara: los mejores juguetes son aquellos que hacen menos cosas, para que la mente del niño haga más.
              </p>

              <p style={{ fontSize: '0.92rem', color: '#665A70', lineHeight: 1.65, marginBottom: 20 }}>
                Seleccionamos maderas nobles de bosques gestionados responsablemente, pigmentos respetuosos de origen vegetal y telas de tacto reconfortante sin piezas plásticas superfluas.
              </p>

              {/* 3 Bullets con checks circulares */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, fontSize: '0.86rem', fontWeight: 700, color: '#2F2636' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#EEF8F3',
                    color: '#41A07D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span>100% materiales nobles, biodegradables y seguros</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#F3EFFB',
                    color: '#8E74BE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span>Fomento del juego libre, la imaginación y la pedagogía Montessori</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#FDF1F4',
                    color: '#DE7B94',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span>Conectividad pura: risas en familia y cero pantallas</span>
                </div>
              </div>

              {/* Firma */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: '#2F2636' }}>
                  Mundo Juguete
                </span>
                <span style={{ fontSize: '0.84rem', color: '#665A70' }}>
                  — Familias felices e infancia
                </span>
                <Heart size={14} fill="#DE7B94" color="#DE7B94" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN: BANNER CTA ("¿LISTOS PARA ENCENDER LA CHISPA?")
          ======================================================== */}
      <section style={{ padding: '40px 0 72px', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #FFF5F4 0%, #FDF1F6 50%, #FAF7F2 100%)',
            borderRadius: 28,
            border: '1px solid #F7D0DA',
            padding: '56px 36px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Luna y estrellas sutiles */}
            <div style={{ position: 'absolute', top: 24, left: 32, opacity: 0.35, color: '#8E74BE' }}>
              <Moon size={36} strokeWidth={1.8} />
            </div>
            <div style={{ position: 'absolute', bottom: 24, right: 36, opacity: 0.35, color: '#DE7B94' }}>
              <Cloud size={44} strokeWidth={1.6} />
            </div>

            <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)',
                fontWeight: 800,
                color: '#2F2636',
                lineHeight: 1.2,
                marginBottom: 14
              }}>
                ¿Listos para encender la chispa del juego?
              </h2>

              <p style={{ fontSize: '0.96rem', color: '#665A70', lineHeight: 1.6, marginBottom: 28 }}>
                Explora nuestro catálogo completo o déjanos asesorarte para encontrar el regalo perfecto según la edad y la curiosidad innata de cada peque.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Link
                  to="/catalogo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 28px',
                    borderRadius: 9999,
                    backgroundColor: '#DE7B94',
                    color: '#FFFFFF',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(222, 123, 148, 0.35)'
                  }}
                >
                  <span>Ir al catálogo completo</span>
                  <ArrowRight size={16} strokeWidth={2.4} />
                </Link>

                <a
                  href="#contacto"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 24px',
                    borderRadius: 9999,
                    backgroundColor: '#FFFFFF',
                    color: '#2F2636',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #EBE3D7'
                  }}
                >
                  <MessageCircle size={16} strokeWidth={2.2} />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
