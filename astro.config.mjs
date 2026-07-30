// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

/**
 * Cambia `site` por tu dominio real: alimenta el canonical, Open Graph,
 * el sitemap y `import.meta.env.SITE` (consumido por `src/data/site.ts`).
 */
export default defineConfig({
  site: 'https://mdms29.github.io',
  base: '/portfolio/',
  trailingSlash: 'never',

  // Prefetch en viewport: la navegacion a /proyectos/[slug] es instantanea
  // sin coste inicial, porque solo se dispara cuando el enlace es visible.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  integrations: [
    // astro-icon resuelve los iconos de los paquetes @iconify-json instalados
    // y los inyecta como SVG en tiempo de build: cero JS, cero peticiones.
    icon(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Un unico chunk de CSS critico; el resto lo decide Rollup por ruta.
      cssMinify: 'lightningcss',
    },
  },

  build: {
    // Inyecta el CSS pequeno en el HTML y deja el grande como <link>.
    inlineStylesheets: 'auto',
  },
});
