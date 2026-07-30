/**
 * "Sobre mi" — el unico texto largo del portfolio.
 *
 * Vive en TypeScript y no en una coleccion porque es un registro unico, no
 * una lista: montar una coleccion de un solo elemento solo anade ceremonia.
 * Sigue cumpliendo la regla del proyecto: ni una frase escrita dentro de un
 * componente.
 */

export interface Principle {
  icon: string;
  title: string;
  description: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface About {
  /** Frase de apertura, destacada tipograficamente. */
  opening: string;
  /** Cuerpo del texto. Un elemento del array = un parrafo. */
  paragraphs: string[];
  /** Como trabajo. Se muestran como tarjetas. */
  principles: Principle[];
  /** Datos sueltos del margen. */
  facts: Fact[];
  /** En que ando ahora mismo. */
  currently: string;
}

export const ABOUT: About = {
  opening:
    'Llevo ocho años construyendo software para la web y sigo creyendo que la mejor interfaz es la que no se nota.',
  paragraphs: [
    'Empecé haciendo páginas para negocios de mi barrio y acabé dirigiendo la plataforma de interfaz de una empresa con seis equipos de producto. Por el camino aprendí que los problemas difíciles casi nunca son técnicos: son de acuerdo, de prioridad y de saber qué se puede dejar sin hacer.',
    'Trabajo sobre todo en la frontera entre diseño y sistemas. Me interesa lo que ocurre cuando una decisión visual se convierte en una restricción de arquitectura, y al revés: cuando una limitación técnica cambia lo que el producto puede prometer. Ahí es donde se decide si un proyecto envejece bien.',
    'Fuera del editor toco el piano regular y voy al teatro más de lo razonable. De ahí salió este portfolio: una obra en la que el escenario cambia, pero el texto siempre se lee.',
  ],
  principles: [
    {
      icon: 'lucide:ruler',
      title: 'Medir antes de opinar',
      description:
        'Un presupuesto de rendimiento en CI resuelve más discusiones que cualquier reunión sobre optimización.',
    },
    {
      icon: 'lucide:accessibility',
      title: 'Accesible o no está terminado',
      description:
        'Teclado, lector de pantalla y contraste no son una fase final: son parte de la definición de hecho.',
    },
    {
      icon: 'lucide:layers',
      title: 'Sistemas, no pantallas',
      description:
        'Prefiero tardar una semana en el sistema de diseño que un día en cada una de las cuarenta pantallas.',
    },
    {
      icon: 'lucide:message-square',
      title: 'Escribir lo que se decide',
      description:
        'Una decisión sin documentar se vuelve a discutir en seis meses, con menos contexto y más gente.',
    },
  ],
  facts: [
    { label: 'Base', value: 'Madrid · CET' },
    { label: 'Idiomas', value: 'Español · Inglés' },
    { label: 'Modalidad', value: 'Remoto o híbrido' },
    { label: 'Enfoque', value: 'Producto y plataforma' },
  ],
  currently:
    'Ahora mismo dirijo la migración de una SPA grande a renderizado en servidor y escribo sobre presupuestos de rendimiento.',
};
