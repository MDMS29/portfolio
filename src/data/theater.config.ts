/**
 * ============================================================================
 * theater.config.ts — el panel de control de la obra.
 * ============================================================================
 * Este es el archivo que se toca para personalizar el COMPORTAMIENTO.
 * (Para el color y la tipografia: `src/styles/tokens.css`.)
 *
 * Lo consumen dos mundos y por eso vive en TypeScript y no en CSS:
 *  - el runtime de animacion (`src/utils/motion.ts`) lo importa directamente,
 *    asi que el bundler puede eliminar el codigo de una funcion desactivada;
 *  - `BaseLayout` proyecta los valores geometricos como custom properties
 *    en <html>, para que el CSS lea exactamente las mismas cifras.
 */

export interface TheaterConfig {
  /** Telon de apertura al cargar la obra. */
  curtain: {
    enabled: boolean;
    /** Si es true solo se ve una vez por pestana (sessionStorage). */
    oncePerSession: boolean;
    /** Duracion total de la apertura, en ms. */
    duration: number;
  };
  /** Reflector que sigue al cursor. Se desactiva solo en tactil. */
  spotlight: {
    enabled: boolean;
    /** Radio del haz en px. */
    size: number;
  };
  /** Parallax de fondo, muy contenido a proposito. */
  parallax: {
    enabled: boolean;
    /** 0 = nada, 1 = exagerado. Recomendado <= 0.6. */
    intensity: number;
  };
  /** Aparicion progresiva de los elementos al entrar en escena. */
  reveal: {
    /** Desplazamiento inicial en px. */
    distance: number;
    /** Duracion de la transicion en ms. */
    duration: number;
    /** Retardo entre hermanos de un mismo grupo, en ms. */
    stagger: number;
    /** Porcion del elemento que debe verse para disparar (0-1). */
    threshold: number;
    /** Margen del observer: negativo abajo = dispara un poco antes de llegar. */
    rootMargin: string;
    /** Retardo maximo acumulable, evita esperas absurdas en listas largas. */
    maxStagger: number;
  };
  /** Elementos de ambiente puramente decorativos. */
  ambience: {
    /** Grano de pelicula sobre toda la escena. */
    grain: boolean;
    /** Motas de polvo flotando en el haz de luz. */
    dustMotes: boolean;
    /** Halo calido en el borde inferior de la escena. */
    footlights: boolean;
  };
  /** Barra de progreso de la funcion en el borde superior. */
  progressRail: boolean;
}

export const theater: TheaterConfig = {
  curtain: {
    enabled: true,
    oncePerSession: true,
    duration: 1500,
  },
  spotlight: {
    enabled: true,
    size: 380,
  },
  parallax: {
    enabled: true,
    intensity: 0.45,
  },
  reveal: {
    distance: 28,
    duration: 620,
    stagger: 90,
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px',
    maxStagger: 540,
  },
  ambience: {
    grain: true,
    dustMotes: true,
    footlights: true,
  },
  progressRail: true,
};

/**
 * Valores que el CSS necesita conocer. Se inyectan como estilo inline en
 * <html> desde BaseLayout: una sola fuente de verdad para JS y para CSS.
 */
export function theaterCssVars(config: TheaterConfig = theater): string {
  return [
    `--reveal-distance:${config.reveal.distance}px`,
    `--reveal-duration:${config.reveal.duration}ms`,
    `--spotlight-size:${config.spotlight.size}px`,
  ].join(';');
}
