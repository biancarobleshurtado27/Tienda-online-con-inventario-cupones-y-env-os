/**
 * Catálogo visual de imágenes de alta calidad para los juguetes de Mundo Juguete.
 * Mapea cada juguete por ID o categoría con fotografías reales, nítidas y estéticas.
 */

const TOY_IMAGES_BY_ID = {
  1: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80', // Bloques Castillo Medieval
  2: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80', // Muñeca Aventurera
  3: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80', // Carro Eléctrico
  4: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80', // Juego de Mesa Reino Mágico
  5: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80', // Oso de Peluche Melocotón
  6: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80', // Maletín de Arte
  7: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80', // Pista de Carreras Doble Loop
  8: 'https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=600&auto=format&fit=crop&q=80', // Plastilina Gourmet
  9: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', // Dragón Mecánico
  10: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80', // Telescopio Infantil
};

const CATEGORY_FALLBACKS = {
  'Construcción': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
  'Muñecas y figuras': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
  'Juegos de mesa': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80',
  'Peluches': 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
  'Arte y manualidades': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
  'Vehículos y Exterior': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80',
};

export const DEFAULT_TOY_IMAGE = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';

export function getToyImageUrl(producto) {
  if (!producto) return DEFAULT_TOY_IMAGE;
  if (producto.imagen_url) return producto.imagen_url;
  if (producto.id && TOY_IMAGES_BY_ID[producto.id]) return TOY_IMAGES_BY_ID[producto.id];
  if (producto.categoria && CATEGORY_FALLBACKS[producto.categoria]) return CATEGORY_FALLBACKS[producto.categoria];
  return DEFAULT_TOY_IMAGE;
}
