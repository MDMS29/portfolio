/**
 * ============================================================================
 * EL GUION — definicion y validacion del contenido.
 * ============================================================================
 * Todo el contenido narrativo vive en `src/content/*.json` y pasa por un
 * esquema Zod. Consecuencias practicas:
 *
 *  1. `entry.data` llega TIPADO a los componentes, sin castings ni `any`.
 *  2. Un dato mal escrito rompe el BUILD, no la pagina en produccion.
 *  3. `reference('tech')` valida que cada tecnologia citada por un proyecto
 *     exista de verdad: un id con una errata no llega nunca a desplegarse.
 *
 * Se usa el loader `file()` (un JSON = una coleccion) en lugar de `glob()`
 * porque estas entradas son registros cortos y estructurados, no articulos.
 * Editar el portfolio es abrir un JSON, no crear diez ficheros sueltos.
 */

import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
// `z` se importa de `astro/zod` y no de `astro:content`: reexportarlo desde
// el modulo virtual quedo deprecado en Astro 7. Es la misma instancia de Zod
// que usa el validador de colecciones, asi que no hay riesgo de duplicarla.
import { z } from 'astro/zod';

/** Mes en formato ISO corto: 2024-03. Suficiente para una linea temporal. */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato esperado: AAAA-MM');

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Formato esperado: #rrggbb');

/* -------------------------------------------------------------------------
   TECNOLOGIAS — el repertorio
   ---------------------------------------------------------------------- */
const tech = defineCollection({
  loader: file('src/content/tech.json'),
  schema: z.object({
    name: z.string().min(1),
    /** Icono Iconify: "coleccion:nombre". Se inyecta como SVG en build. */
    icon: z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/, 'Formato esperado: coleccion:icono'),
    category: z.enum(['frontend', 'backend', 'datos', 'infra', 'calidad', 'diseno']),
    /** Cuanto peso tiene en mi dia a dia; ordena la vista de tecnologias. */
    level: z.enum(['nucleo', 'solido', 'en-uso']),
    since: z.number().int().min(2000).max(2100),
    note: z.string().max(140),
    url: z.url().optional(),
  }),
});

/* -------------------------------------------------------------------------
   EXPERIENCIA — la gira
   ---------------------------------------------------------------------- */
const experience = defineCollection({
  loader: file('src/content/experience.json'),
  schema: z.object({
    role: z.string().min(1),
    company: z.string().min(1),
    companyUrl: z.url().optional(),
    start: yearMonth,
    /** `null` significa "en la actualidad". */
    end: yearMonth.nullable(),
    location: z.string(),
    mode: z.enum(['remoto', 'hibrido', 'presencial']),
    summary: z.string(),
    highlights: z.array(z.string()).min(1).max(5),
    stack: z.array(reference('tech')).min(1),
  }),
});

/* -------------------------------------------------------------------------
   PROYECTOS — las obras
   ---------------------------------------------------------------------- */
const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: z.object({
    title: z.string().min(1),
    tagline: z.string().max(160),
    year: z.number().int().min(2000).max(2100),
    role: z.string(),
    status: z.enum(['produccion', 'beta', 'archivado']),
    /** Los destacados abren el acto con una tarjeta a doble ancho. */
    featured: z.boolean().default(false),
    /** Menor = antes. A igualdad, ordena por ano descendente. */
    order: z.number().int().default(100),
    /** Color de cartel del proyecto; tine el poster generado y el detalle. */
    accent: hexColor,
    tags: z.array(z.string()).min(1).max(4),
    stack: z.array(reference('tech')).min(1),
    links: z
      .object({
        demo: z.url().optional(),
        repo: z.url().optional(),
      })
      .default({}),
    metrics: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .max(3)
      .default([]),
    /** Caso de estudio de la pagina de detalle. */
    story: z.object({
      overview: z.string(),
      challenge: z.string(),
      solution: z.string(),
      outcome: z.string(),
    }),
  }),
});

/* -------------------------------------------------------------------------
   SERVICIOS — la compania
   ---------------------------------------------------------------------- */
const services = defineCollection({
  loader: file('src/content/services.json'),
  schema: z.object({
    title: z.string().min(1),
    icon: z.string(),
    summary: z.string(),
    deliverables: z.array(z.string()).min(2).max(5),
    /** Marca el servicio principal en la retícula. */
    highlighted: z.boolean().default(false),
  }),
});

/* -------------------------------------------------------------------------
   CERTIFICACIONES — los galardones
   ---------------------------------------------------------------------- */
const certifications = defineCollection({
  loader: file('src/content/certifications.json'),
  schema: z.object({
    title: z.string().min(1),
    issuer: z.string().min(1),
    issuerIcon: z.string(),
    date: yearMonth,
    credentialId: z.string().optional(),
    url: z.url().optional(),
    skills: z.array(z.string()).min(1).max(4),
  }),
});

/* -------------------------------------------------------------------------
   TESTIMONIOS — la critica
   ---------------------------------------------------------------------- */
const testimonials = defineCollection({
  loader: file('src/content/testimonials.json'),
  schema: z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
    role: z.string(),
    company: z.string(),
    /** Iniciales del avatar; evita cargar fotos de terceros. */
    initials: z.string().min(1).max(2),
    relation: z.enum(['cliente', 'companero', 'responsable']),
    url: z.url().optional(),
  }),
});

export const collections = {
  tech,
  experience,
  projects,
  services,
  certifications,
  testimonials,
};
