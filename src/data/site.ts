/**
 * Metadatos globales del sitio: identidad, SEO por defecto y datos del autor.
 * `url` deriva de `site` en astro.config.mjs — un unico sitio de verdad.
 */

export interface SiteConfig {
  name: string;
  /** Nombre corto para el <title> compuesto y el manifest. */
  shortName: string;
  url: string;
  locale: string;
  /** Codigo BCP-47 para <html lang>. */
  lang: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  ogImage: string;
  themeColor: { light: string; dark: string };
  author: {
    name: string;
    role: string;
    tagline: string;
    email: string;
    location: string;
    timezone: string;
    availableForWork: boolean;
    /**
     * Ruta al CV (por ejemplo `/cv.pdf`, dejandolo en `public/`).
     * Vacio = no se muestra el boton de descarga, en lugar de ofrecer un
     * enlace roto.
     */
    cvUrl: string;
    /** Perfiles usados para el `sameAs` del JSON-LD. */
    sameAs: string[];
  };
  contact: {
    /**
     * Endpoint del formulario (Formspree, Basin, Netlify Forms...).
     * Si se deja vacio, la seccion de contacto NO pinta el formulario y
     * ofrece solo el correo: es preferible a un formulario que no envia nada.
     */
    formEndpoint: string;
    /** Enlace a tu agenda. Vacio = no se muestra el boton. */
    schedulingUrl: string;
    /** Tiempo de respuesta que te comprometes a cumplir. */
    responseTime: string;
  };
}

export const SITE: SiteConfig = {
  name: 'Teatro del Código',
  shortName: 'Teatro',
  url: import.meta.env.SITE ?? 'https://tu-dominio.com',
  locale: 'es_ES',
  lang: 'es',
  defaultTitle: 'Moises Mazo — Desarrollador Full Stack',
  titleTemplate: '%s · Moises Mazo',
  description:
    'Portfolio de Moises Mazo, desarrollador Full Stack. Una obra en nueve actos sobre interfaces rapidas, accesibles y bien construidas.',
  keywords: [
    'desarrollador full stack',
    'frontend engineer',
    'Astro',
    'TypeScript',
    'React',
    'Node.js',
    'portfolio',
  ],
  // PNG y no SVG: X, LinkedIn y WhatsApp no renderizan SVG en las tarjetas.
  ogImage: '/og/portada.png',
  themeColor: { light: '#f7f3ec', dark: '#0b0a0f' },
  author: {
    name: 'Moises Mazo',
    role: 'Desarrollador Full Stack',
    tagline: 'Construyo productos web que se sienten como deben sentirse.',
    email: 'hola@tu-dominio.com',
    location: 'Colombia',
    timezone: 'America/Bogota',
    availableForWork: true,
    cvUrl: '',
    sameAs: [
      'https://github.com/tu-usuario',
      'https://linkedin.com/in/tu-usuario',
      'https://x.com/tu-usuario',
    ],
  },
  contact: {
    formEndpoint: '',
    schedulingUrl: '',
    responseTime: 'Respondo en menos de 24 horas laborables',
  },
};
