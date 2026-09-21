/**
 * Galería «О клубе». Coloca tus fotos en ui/public/about/
 * y actualiza src (ruta desde la raíz del sitio, ej. /about/sala.jpg).
 *
 * wide: true — slot ancho (primera foto, recomendada panorámica).
 * Si src está vacío, se muestra el placeholder con gradiente.
 */
export interface AboutGalleryItem {
  src: string;
  label: string;
  wide?: boolean;
}

export const ABOUT_GALLERY: AboutGalleryItem[] = [
  { src: '/about/01.jpg', label: 'CyberX · Зал', wide: true },
  { src: '/about/02.jpg', label: 'CyberX · Stage' },
  { src: '/about/03.jpg', label: 'CyberX · Bootcamp' },
  { src: '/about/04.jpg', label: 'CyberX · Lounge' },
];

/** Badges sobre el texto del manifiesto */
export const ABOUT_BADGES = ['RTX 4090', '540 HZ', '360Hz OLED', 'TOP 1'] as const;

/** Tres «столпа» bajo el tagline */
export const ABOUT_PILLARS = [
  { icon: 'cpu' as const, value: 'RTX 4090', labelKey: 'about.hardware' as const },
  { icon: 'gauge' as const, value: '540 HZ', labelKey: 'about.monitors' as const },
  { icon: 'trophy' as const, value: '#1', labelKey: 'about.city_rank' as const, useCity: true },
] as const;
