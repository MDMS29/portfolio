/**
 * El programa de mano: cada acto de la obra es una entrada de navegacion.
 *
 * `id` es a la vez el ancla (#id), la clave del scroll-spy y el identificador
 * del acto. Anadir una seccion se reduce a: anadir aqui + montar el componente.
 */

export interface Act {
  /** Ancla en la pagina y id del <section>. */
  id: string;
  /** Numero romano del acto, mostrado en la escena. */
  act: string;
  /** Etiqueta corta para la barra de navegacion. */
  label: string;
  /** Titulo largo de la escena. */
  title: string;
  /** Aparece en el menu principal. */
  inNav: boolean;
}

export const ACTS: Act[] = [
  { id: 'apertura', act: 'Preludio', label: 'Inicio', title: 'Se abre el telón', inNav: false },
  { id: 'sobre-mi', act: 'Acto I', label: 'Sobre mí', title: 'El protagonista', inNav: true },
  { id: 'tecnologias', act: 'Acto II', label: 'Tecnologías', title: 'El repertorio', inNav: true },
  { id: 'experiencia', act: 'Acto III', label: 'Experiencia', title: 'La gira', inNav: true },
  // { id: 'proyectos', act: 'Acto IV', label: 'Proyectos', title: 'Las obras', inNav: true },
  { id: 'servicios', act: 'Acto IV', label: 'Servicios', title: 'La compañía', inNav: true },
  // {
  //   id: 'certificaciones',
  //   act: 'Acto VI',
  //   label: 'Certificaciones',
  //   title: 'Los galardones',
  //   inNav: true,
  // },
  // { id: 'testimonios', act: 'Acto VII', label: 'Testimonios', title: 'La crítica', inNav: true },
  { id: 'contacto', act: 'Epílogo', label: 'Contacto', title: 'Tras el telón', inNav: true },
];

/** Actos visibles en la barra de navegacion. */
export const NAV_ACTS: Act[] = ACTS.filter((act) => act.inNav);

/** Busca un acto por id. Lanza en build si no existe: falla pronto y fuerte. */
export function getAct(id: string): Act {
  const act = ACTS.find((entry) => entry.id === id);
  if (!act) {
    throw new Error(
      `[navigation] No existe el acto "${id}". Añadelo a ACTS en src/data/navigation.ts.`
    );
  }
  return act;
}
