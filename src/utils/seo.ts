/**
 * ============================================================================
 * SEO — construccion de metadatos y datos estructurados.
 * ============================================================================
 * Se centraliza aqui para que `BaseLayout` sea declarativo y para que el
 * JSON-LD no acabe copiado y pegado (y desactualizado) en cada pagina.
 */

import { SITE } from '@data/site';
import type { ProjectEntry } from './collections';

/** Une una ruta con el dominio del sitio, sin dobles barras ni sorpresas. */
export function absoluteUrl(path: string, base: string | URL = SITE.url): string {
  return new URL(path, base).href;
}

/** Aplica la plantilla de titulo salvo en la home, que ya trae el suyo. */
export function buildTitle(title?: string): string {
  if (!title) return SITE.defaultTitle;
  return SITE.titleTemplate.replace('%s', title);
}

export interface SeoInput {
  title?: string;
  description?: string;
  /** Ruta canonica (`Astro.url.pathname`). */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  /** Excluye la pagina de los indices (404, borradores...). */
  noindex?: boolean;
}

export interface SeoOutput {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: 'website' | 'article';
  robots: string;
}

export function buildSeo(input: SeoInput): SeoOutput {
  return {
    title: buildTitle(input.title),
    description: input.description ?? SITE.description,
    canonical: absoluteUrl(input.path),
    image: absoluteUrl(input.image ?? SITE.ogImage),
    type: input.type ?? 'website',
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  };
}

/* -------------------------------------------------------------------------
   JSON-LD
   Se emite un unico @graph en lugar de varios <script>: menos bytes y
   relaciones explicitas entre entidades mediante @id.
   ---------------------------------------------------------------------- */

type JsonLdNode = Record<string, unknown>;

export function personSchema(): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': `${SITE.url}#persona`,
    name: SITE.author.name,
    jobTitle: SITE.author.role,
    description: SITE.author.tagline,
    email: `mailto:${SITE.author.email}`,
    url: SITE.url,
    sameAs: SITE.author.sameAs,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.author.location,
    },
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}#sitio`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.lang,
    author: { '@id': `${SITE.url}#persona` },
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

export function projectSchema(project: ProjectEntry): JsonLdNode {
  return {
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/proyectos/${project.id}#obra`),
    name: project.data.title,
    abstract: project.data.tagline,
    description: project.data.story.overview,
    dateCreated: String(project.data.year),
    creator: { '@id': `${SITE.url}#persona` },
    keywords: project.data.tags.join(', '),
    url: absoluteUrl(`/proyectos/${project.id}`),
  };
}

/** Envuelve los nodos en el sobre @context/@graph listo para serializar. */
export function jsonLdGraph(...nodes: JsonLdNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
