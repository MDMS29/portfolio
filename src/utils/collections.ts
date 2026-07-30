/**
 * ============================================================================
 * Acceso al contenido — la unica capa que habla con `astro:content`.
 * ============================================================================
 * Las secciones nunca llaman a `getCollection` directamente. Motivos:
 *
 *  - El ORDEN de cada coleccion es una regla de negocio (los proyectos van por
 *    `order` y luego por ano; la experiencia, del ultimo al primero). Vive
 *    aqui una sola vez, no repartida por nueve componentes.
 *  - Resolver las `reference('tech')` requiere un mapa. Construirlo por
 *    proyecto seria O(n*m); se construye una vez y se reutiliza.
 *  - Si manana el contenido viniera de un CMS, solo cambia este archivo.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type TechEntry = CollectionEntry<'tech'>;
export type ExperienceEntry = CollectionEntry<'experience'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export type ServiceEntry = CollectionEntry<'services'>;
export type CertificationEntry = CollectionEntry<'certifications'>;
export type TestimonialEntry = CollectionEntry<'testimonials'>;

/** Referencia a `tech` tal y como la deja Zod tras `reference()`. */
type TechRef = { collection: 'tech'; id: string };

/* -------------------------------------------------------------------------
   TECNOLOGIAS
   ---------------------------------------------------------------------- */

const LEVEL_WEIGHT: Record<TechEntry['data']['level'], number> = {
  nucleo: 0,
  solido: 1,
  'en-uso': 2,
};

export async function getTech(): Promise<TechEntry[]> {
  const entries = await getCollection('tech');
  return entries.sort(
    (a, b) =>
      LEVEL_WEIGHT[a.data.level] - LEVEL_WEIGHT[b.data.level] ||
      a.data.since - b.data.since ||
      a.data.name.localeCompare(b.data.name, 'es')
  );
}

/** Mapa id -> entrada, para resolver referencias sin volver a leer la coleccion. */
export async function getTechMap(): Promise<Map<string, TechEntry>> {
  const entries = await getCollection('tech');
  return new Map(entries.map((entry) => [entry.id, entry]));
}

/** Agrupa el repertorio por categoria, respetando el orden declarado. */
export async function getTechByCategory(): Promise<
  Array<{ category: TechEntry['data']['category']; items: TechEntry[] }>
> {
  const entries = await getTech();
  const order: TechEntry['data']['category'][] = [
    'frontend',
    'backend',
    'datos',
    'infra',
    'calidad',
    'diseno',
  ];

  return order
    .map((category) => ({
      category,
      items: entries.filter((entry) => entry.data.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Traduce las referencias de un proyecto/experiencia a entradas reales.
 * Zod ya garantizo en build que los ids existen, asi que un `undefined` aqui
 * solo puede venir de un mapa incompleto: se filtra en vez de reventar.
 */
export function resolveTech(map: Map<string, TechEntry>, refs: readonly TechRef[]): TechEntry[] {
  return refs.map((ref) => map.get(ref.id)).filter((entry): entry is TechEntry => Boolean(entry));
}

/* -------------------------------------------------------------------------
   EXPERIENCIA — del puesto mas reciente al mas antiguo
   ---------------------------------------------------------------------- */

export async function getExperience(): Promise<ExperienceEntry[]> {
  const entries = await getCollection('experience');
  return entries.sort((a, b) => b.data.start.localeCompare(a.data.start));
}

/* -------------------------------------------------------------------------
   PROYECTOS
   ---------------------------------------------------------------------- */

export async function getProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return entries.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  return (await getProjects()).filter((entry) => entry.data.featured);
}

/**
 * Vecinos de un proyecto en el orden del acto, para navegar entre casos de
 * estudio sin volver a la home. Cicla, asi que nunca hay un callejon sin salida.
 */
export async function getProjectNeighbours(
  id: string
): Promise<{ prev: ProjectEntry; next: ProjectEntry } | null> {
  const projects = await getProjects();
  if (projects.length < 2) return null;

  const index = projects.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  return {
    prev: projects[(index - 1 + projects.length) % projects.length]!,
    next: projects[(index + 1) % projects.length]!,
  };
}

/* -------------------------------------------------------------------------
   SERVICIOS · CERTIFICACIONES · TESTIMONIOS
   ---------------------------------------------------------------------- */

export async function getServices(): Promise<ServiceEntry[]> {
  const entries = await getCollection('services');
  return entries.sort((a, b) => Number(b.data.highlighted) - Number(a.data.highlighted));
}

export async function getCertifications(): Promise<CertificationEntry[]> {
  const entries = await getCollection('certifications');
  return entries.sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export async function getTestimonials(): Promise<TestimonialEntry[]> {
  return getCollection('testimonials');
}
