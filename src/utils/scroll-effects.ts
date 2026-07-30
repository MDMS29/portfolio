/**
 * ============================================================================
 * Efectos ligados al scroll — el unico codigo que depende de `motion`.
 * ============================================================================
 * Este modulo existe por una razon concreta de bundling, y merece la pena
 * dejarla escrita:
 *
 *   `await import('motion')` devuelve el NAMESPACE completo del paquete. Al
 *   tener que existir todos sus exports, el bundler no puede eliminar nada:
 *   el chunk pesaba 132 kB. Importando aqui solo `scroll` y `animateMini` de
 *   forma ESTATICA, y cargando dinamicamente ESTE modulo, el tree-shaking
 *   vuelve a funcionar y quedan ~20 kB.
 *
 * `animateMini` es el motor WAAPI puro de Motion: sin springs ni timelines,
 * que aqui no hacen falta. El navegador anima en el compositor.
 */

import { scroll, animateMini as animate } from 'motion';

export interface ScrollEffectsOptions {
  /** Barra de progreso de lectura, animada con scaleX. */
  rail: HTMLElement | null;
  /** Capas con `data-parallax="<profundidad>"`. */
  layers: HTMLElement[];
  /** Multiplicador global de intensidad (theater.config.ts). */
  intensity: number;
}

/** Monta los efectos y devuelve un unico teardown que los desmonta todos. */
export function mountScrollEffects({ rail, layers, intensity }: ScrollEffectsOptions): () => void {
  const stops: Array<() => void> = [];

  if (rail) {
    stops.push(scroll(animate(rail, { scaleX: [0, 1] }, { ease: 'linear' })));
  }

  for (const layer of layers) {
    const depth = Number(layer.dataset.parallax) || 0.2;
    const shift = Math.round(depth * intensity * 100);
    if (shift === 0) continue;

    stops.push(
      scroll(animate(layer, { y: [`${shift}px`, `${-shift}px`] }, { ease: 'linear' }), {
        target: layer,
        // La capa recorre su rango completo entre "entra por abajo" y
        // "sale por arriba": el desplazamiento nunca se corta a medias.
        offset: ['start end', 'end start'],
      })
    );
  }

  return () => {
    for (const stop of stops) stop();
  };
}
