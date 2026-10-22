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
  Store, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Tag, 
  HeartHandshake, 
  Boxes, 
  BookOpen, 
  Compass, 
  Clock,
  Layers,
  Star
} from 'lucide-react';

const CATEGORIAS_DESTACADAS = [
  { nombre: 'Construcción', descripcion: 'Bloques de madera y sets para pequeños arquitectos' },
  { nombre: 'Muñecas y figuras', descripcion: 'Compañeros de aventuras y fantasía para soñar' },
  { nombre: 'Juegos de mesa', descripcion: 'Estrategia y risas compartidas en familia' },
  { nombre: 'Peluches', descripcion: 'Abrazos suaves con materiales hipoalergénicos' },
  { nombre: 'Arte y manualidades', descripcion: 'Colores, plastilinas y lienzos para pequeños artistas' },
  { nombre: 'Vehículos y Exterior', descripcion: 'Pistas, autos y diversión bajo el sol' },
];

export default function HomePage() {
  const { data: productosData, loading, error, refetch } = useFetch(getProductos, [], []);
  const productos = useMemo(() => (Array.isArray(productosData) ? productosData : []), [productosData]);

  // Selección de 6 productos destacados con existencias
  const destacados = useMemo(() => {
    return productos
      .filter(p => p.activo && p.stock > 0)
      .slice(0, 6);
  }, [productos]);

  return (
    <div className="fade-in">
      {/* ========================================================
          HERO SECTION: NUBE DE ALGODÓN & CATÁLOGO DE CUENTO
          ======================================================== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '48px',
        paddingBottom: '64px',
        background: 'linear-gradient(180deg, rgba(243, 239, 251, 0.7) 0%, rgba(250, 247, 242, 1) 100%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Adornos sutiles de fondo (nubes/bloques decorativos) */}
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 240,
          height: 240,
          borderRadius: '50%',
          backgroundColor: 'rgba(222, 123, 148, 0.08)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          backgroundColor: 'rgba(142, 116, 190, 0.09)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            maxWidth: 820,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            {/* Tag amigable de cabecera */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--pastel-lavender-border)',
              color: 'var(--pastel-lavender-text)',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 20
            }}>
              <Sparkles size={16} strokeWidth={2.4} color="var(--pastel-lavender)" />
              <span>Juguetería Mágica para la Infancia Consciente</span>
            </div>

            {/* Título Principal */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.1rem, 4.8vw, 3.4rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              marginBottom: 18
            }}>
              Donde cada juguete enciende la fantasía y crea sonrisas eternas
            </h1>

            {/* Subtítulo / Descripción del Hero */}
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 auto 32px'
            }}>
              Bienvenido a Mundo Juguete. Un catálogo artesanal diseñado para que niñas y niños exploren, construyan y sueñen en grande, lejos de las pantallas y cerca del corazón.
            </p>

            {/* Botones de Llamado a la Acción */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14
            }}>
              <Link 
                to="/catalogo"
                className="btn btn-primary"
                style={{
                  padding: '13px 28px',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(142, 116, 190, 0.32)'
                }}
              >
                <Store size={18} strokeWidth={2.3} />
                <span>Explorar Catálogo de Juguetes</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <a 
                href="#historia"
                className="btn btn-secondary"
                style={{
                  padding: '13px 24px',
                  fontSize: '0.96rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <BookOpen size={16} strokeWidth={2.2} />
                <span>Nuestra Historia</span>
              </a>
            </div>

            {/* Fila de Insignias de Confianza */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid rgba(235, 227, 215, 0.8)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Truck size={16} color="var(--pastel-lavender)" strokeWidth={2.4} /> Envíos calculados por ciudad
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Tag size={16} color="var(--pastel-rose)" strokeWidth={2.4} /> Cupones promocionales acumulables
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="var(--pastel-mint)" strokeWidth={2.4} /> Inventario en tiempo real
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CATEGORÍAS DESTACADAS
          ======================================================== */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--pastel-rose)',
              backgroundColor: 'var(--pastel-rose-light)',
              padding: '4px 12px',
              borderRadius: 9999,
              display: 'inline-block',
              marginBottom: 10
            }}>
              Mundos de Aprendizaje
            </span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: 10
            }}>
              Explora por Categorías Pedagógicas
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto' }}>
              Desde retos de lógica y construcción hasta aventuras de rol y expresión artística para todas las edades.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20
          }}>
            {CATEGORIAS_DESTACADAS.map((cat) => (
              <CategoryCard 
                key={cat.nombre}
                nombre={cat.nombre}
                descripcion={cat.descripcion}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          PRODUCTOS DESTACADOS DESDE LA API
          ======================================================== */}
      <section style={{
        padding: '64px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 36
          }}>
            <div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--pastel-lavender-text)',
                backgroundColor: 'var(--pastel-lavender-light)',
                padding: '4px 12px',
                borderRadius: 9999,
                display: 'inline-block',
                marginBottom: 10
              }}>
                Favoritos de la Tienda
              </span>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0
              }}>
                Juguetes Más Deseados
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: 6, margin: 0 }}>
                Disponibilidad inmediata sincronizada con nuestro almacén central.
              </p>
            </div>

            <Link
              to="/catalogo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 800,
                fontSize: '0.9rem',
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              <span>Ver todos los juguetes ({productos.length})</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Cargando juguetes destacados desde el catálogo..." />
          ) : error ? (
            <ErrorState title="Error al cargar productos" message={error} onRetry={refetch} />
          ) : destacados.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
              No hay juguetes destacados disponibles en este momento.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 22
            }}>
              {destacados.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          BENEFICIOS: INVENTARIO, CUPONES, ENVÍOS, ATENCIÓN
          ======================================================== */}
      <section id="beneficios" style={{ padding: '72px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--pastel-mint-text)',
              backgroundColor: 'var(--pastel-mint-light)',
              padding: '4px 12px',
              borderRadius: 9999,
              display: 'inline-block',
              marginBottom: 10
            }}>
              La Experiencia Mundo Juguete
            </span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: 8
            }}>
              ¿Por qué elegir nuestra juguetería?
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto' }}>
              Creamos un entorno de compra transparente, seguro y cálido para ti y tu familia.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24
          }}>
            {/* Beneficio 1 */}
            <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-lavender-light)',
                color: 'var(--pastel-lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <ShieldCheck size={26} strokeWidth={2.3} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                Inventario en Tiempo Real
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Control estricto de existencias con transacciones atómicas. Si un juguete está visible, está garantizado en nuestro almacén.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-rose-light)',
                color: 'var(--pastel-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <Tag size={26} strokeWidth={2.3} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                Cupones de Descuento
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Aplica cupones especiales como <code>BIENVENIDA10</code> en tu carrito para obtener descuentos mágicos directos.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-butter-light)',
                color: 'var(--pastel-butter-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <Truck size={26} strokeWidth={2.3} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                Tarifas de Envío por Ciudad
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Cálculo transparente de entregas según tu localidad en Costa Rica, con envíos gratuitos para compras mayores a $50.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-mint-light)',
                color: 'var(--pastel-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <HeartHandshake size={26} strokeWidth={2.3} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                Atención y Asesoría Cercana
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Te orientamos con cariño para encontrar el juguete perfecto según la etapa evolutiva e intereses de cada niño.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECCIÓN "NUESTRA HISTORIA"
          ======================================================== */}
      <section id="historia" style={{
        padding: '72px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center'
          }}>
            {/* Lado Izquierdo: Ilustración/Mural Textual de Cuento */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--pastel-lavender-text)',
                backgroundColor: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: 9999,
                marginBottom: 16,
                border: '1px solid var(--border-color)'
              }}>
                <Sparkles size={14} color="var(--pastel-lavender)" /> El Manifiesto del Juego
              </div>

              <blockquote style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.45,
                margin: '0 0 16px',
                fontStyle: 'normal'
              }}>
                "El juego no es un pasatiempo: es el lenguaje primordial con el que los niños descubren quiénes son y construyen su mundo."
              </blockquote>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                En nuestro taller cuidamos cada material, cada textura y cada historia para que el juego vuelva a ser un momento sagrado de conexión familiar.
              </p>
            </div>

            {/* Lado Derecho: Historia de Mundo Juguete */}
            <div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--pastel-rose)',
                backgroundColor: 'var(--pastel-rose-light)',
                padding: '4px 12px',
                borderRadius: 9999,
                display: 'inline-block',
                marginBottom: 10
              }}>
                Nuestra Historia
              </span>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.1rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                marginBottom: 18
              }}>
                Un sueño que nació para devolverle el asombro a la infancia
              </h2>

              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16 }}>
                Mundo Juguete comenzó como una pequeña iniciativa familiar motivada por una inquietud compartida: en una época colmada de pantallas y notificaciones instantáneas, los niños estaban perdiendo el placer de construir castillos con sus propias manos, inventar personajes con muñecos de tela y sentarse en la alfombra a compartir un juego de mesa.
              </p>

              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24 }}>
                Hoy nos enorgullece ser un punto de encuentro para familias y educadores. Seleccionamos y curamos cada juguete evaluando su valor didáctico, su durabilidad y su capacidad para despertar la inventiva. Cuando compras en Mundo Juguete, no llevas un objeto: llevas una semilla de curiosidad.
              </p>

              <Link
                to="/catalogo"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  padding: '12px 22px'
                }}
              >
                <span>Descubre Nuestra Colección</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
