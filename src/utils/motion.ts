/**
 * ============================================================================
 * EL REGIDOR — runtime de animacion del teatro.
 * ============================================================================
 * Un unico modulo gobierna todo el movimiento de la pagina. No hay scripts
 * sueltos por seccion: los componentes solo declaran intencion con atributos
 * (`data-reveal`, `data-parallax`, `data-spotlight-surface`) y esto los lee.
 *
 * Principios, por orden de importancia:
 *
 *  1. CSS ANIMA, JS DECIDE. El revelado es una transicion CSS; JS solo anade
 *     una clase. Cero animaciones en el hilo principal, cero rAF por elemento.
 *  2. UN OBSERVER PARA TODOS. Un IntersectionObserver global que ademas hace
 *     `unobserve` tras revelar: el coste tiende a cero segun bajas.
 *  3. LO CARO SE CARGA TARDE. `motion` (~5 kB) entra por import dinamico y
 *     solo si de verdad hay algo que animar con scroll. Quien navega con
 *     `prefers-reduced-motion` no lo descarga jamas.
 *  4. TODO ES REVERSIBLE. Cada efecto registra su teardown para que las
 *     View Transitions no dejen observers ni listeners huerfanos.
 */

import { theater } from '@data/theater.config';

type Teardown = () => void;

const teardowns: Teardown[] = [];

function register(teardown: Teardown): void {
  teardowns.push(teardown);
}

/** Desmonta todos los efectos. Idempotente. */
export function destroyTheater(): void {
  while (teardowns.length) {
    try {
      teardowns.pop()?.();
    } catch {
      /* un teardown roto no puede impedir los demas */
    }
  }
}

/**
 * El unico interruptor de movimiento. Lo pone el script inline del <head>
 * y solo vale "on" si hay JS Y el usuario no pidio reducir el movimiento.
 */
function motionAllowed(): boolean {
  return document.documentElement.dataset.motion === 'on';
}

/* =========================================================================
   1 · REVELADO PROGRESIVO
   ====================================================================== */

function applyStagger(): void {
  const groups = document.querySelectorAll<HTMLElement>('[data-reveal-stagger]');

  for (const group of groups) {
    const step = Number(group.dataset.revealStagger) || theater.reveal.stagger;
    const children = group.querySelectorAll<HTMLElement>('[data-reveal]');

    children.forEach((child, index) => {
      // Un retardo calculado en build (estilo inline) siempre manda: es gratis.
      if (child.style.getPropertyValue('--reveal-delay')) return;
      const delay = Math.min(index * step, theater.reveal.maxStagger);
      child.style.setProperty('--reveal-delay', `${delay}ms`);
    });
  }
}

function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  applyStagger();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        // Ya ha salido a escena: no vuelve a ocultarse ni a observarse.
        observer.unobserve(entry.target);
      }
    },
    {
      threshold: theater.reveal.threshold,
      rootMargin: theater.reveal.rootMargin,
    }
  );

  for (const target of targets) observer.observe(target);
  register(() => observer.disconnect());
}

/** Red de seguridad: si el movimiento esta desactivado, todo visible ya. */
function revealEverything(): void {
  for (const el of document.querySelectorAll('[data-reveal]')) {
    el.classList.add('is-revealed');
  }
}

/* =========================================================================
   2 · REFLECTOR
   Un solo listener en el documento alimenta el haz global Y el brillo de la
   tarjeta bajo el cursor. Todas las lecturas de layout ocurren antes que las
   escrituras dentro del mismo frame, para no forzar reflows.
   ====================================================================== */

function initSpotlight(): void {
  if (!theater.spotlight.enabled) return;
  // Sin cursor no hay reflector que seguir: en tactil no cuesta ni un byte.
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const beam = document.querySelector<HTMLElement>('[data-spotlight]');
  let pointerX = 0;
  let pointerY = 0;
  let surface: HTMLElement | null = null;
  let frame = 0;

  const paint = (): void => {
    frame = 0;
    // LECTURAS primero...
    const rect = surface?.getBoundingClientRect();
    // ...ESCRITURAS despues.
    if (beam) {
      beam.style.setProperty('--pointer-x', `${pointerX}px`);
      beam.style.setProperty('--pointer-y', `${pointerY}px`);
    }
    if (surface && rect) {
      surface.style.setProperty('--surface-x', `${pointerX - rect.left}px`);
      surface.style.setProperty('--surface-y', `${pointerY - rect.top}px`);
    }
  };

  const onMove = (event: PointerEvent): void => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    const target = event.target;
    surface =
      target instanceof Element ? target.closest<HTMLElement>('[data-spotlight-surface]') : null;

    beam?.classList.add('is-lit');
    if (frame === 0) frame = requestAnimationFrame(paint);
  };

  const onLeave = (): void => beam?.classList.remove('is-lit');

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  register(() => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    if (frame) cancelAnimationFrame(frame);
    beam?.classList.remove('is-lit');
  });
}

/* =========================================================================
   3 · ACTO EN CURSO (scroll-spy)
   No es decorativo: informa al usuario de donde esta, asi que se ejecuta
   SIEMPRE, tambien con prefers-reduced-motion.
   ====================================================================== */

function initScrollSpy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-act-link]'));
  if (links.length === 0) return;

  const sections = links
    .map((link) => document.getElementById(link.dataset.actLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);
  if (sections.length === 0) return;

  const visible = new Set<Element>();
  let current = '';

  const setCurrent = (id: string): void => {
    if (id === current) return;
    current = id;
    for (const link of links) {
      const active = link.dataset.actLink === id;
      link.classList.toggle('is-current', active);
      // aria-current es lo que anuncia el lector de pantalla; la clase solo pinta.
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }

      // De las secciones que cruzan la banda central, gana la mas alta.
      let best: Element | null = null;
      let bestTop = Number.POSITIVE_INFINITY;
      for (const section of visible) {
        const top = section.getBoundingClientRect().top;
        if (top < bestTop) {
          bestTop = top;
          best = section;
        }
      }
      if (best) setCurrent(best.id);
    },
    // Banda estrecha en mitad de la pantalla: la seccion "actual" es la que
    // el usuario esta mirando, no la que asoma por el borde.
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  for (const section of sections) observer.observe(section);
  register(() => observer.disconnect());
}

/* =========================================================================
   4 · ESTADO DE LA BARRA SUPERIOR
   Un centinela de 1 px en lo alto del documento sustituye al clasico
   listener de scroll: el navegador hace el trabajo, no el hilo principal.
   ====================================================================== */

function initNavState(): void {
  const sentinel = document.querySelector('[data-scroll-sentinel]');
  const header = document.querySelector('[data-site-header]');
  if (!sentinel || !header) return;

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-scrolled', !entry?.isIntersecting),
    { threshold: 0 }
  );

  observer.observe(sentinel);
  register(() => observer.disconnect());
}

/* =========================================================================
   5 · EFECTOS LIGADOS AL SCROLL (parallax + barra de progreso)
   Lo unico que justifica cargar `motion`. Se aisla en `scroll-effects.ts`
   e importa de forma dinamica: quien navega con `prefers-reduced-motion`,
   sin JS o sin capas de parallax en pantalla no descarga ni un byte.
   ====================================================================== */

async function initScrollDriven(): Promise<void> {
  const rail = theater.progressRail
    ? document.querySelector<HTMLElement>('[data-progress-rail]')
    : null;

  const layers = theater.parallax.enabled
    ? Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    : [];

  if (!rail && layers.length === 0) return;

  try {
    const { mountScrollEffects } = await import('./scroll-effects');
    register(mountScrollEffects({ rail, layers, intensity: theater.parallax.intensity }));
  } catch {
    // Si el chunk no llega, la pagina sigue siendo perfectamente usable:
    // el parallax y la barra de progreso son puramente decorativos.
  }
}

/* =========================================================================
   ARRANQUE
   ====================================================================== */

export function initTheater(): void {
  destroyTheater();

  // Funcionalidad: siempre.
  initScrollSpy();
  initNavState();

  // Decoracion: solo si procede.
  if (!motionAllowed()) {
    revealEverything();
    return;
  }

  initReveals();
  initSpotlight();
  void initScrollDriven();
}
