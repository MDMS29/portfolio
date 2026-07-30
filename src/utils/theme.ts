/**
 * Tema claro/oscuro.
 *
 * La aplicacion INICIAL del tema no vive aqui: la hace un script inline y
 * bloqueante en el <head> (ver BaseLayout). Cualquier solucion que espere a
 * que cargue un modulo produce un destello blanco en modo oscuro.
 * Este archivo solo gestiona el cambio manual, que ya ocurre con la pagina
 * pintada y puede permitirse llegar tarde.
 */

export const THEME_KEY = 'teatro:tema';
export type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme: Theme, persist = true): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* almacenamiento bloqueado: el tema durara lo que dure la pagina */
    }
  }
  document.dispatchEvent(new CustomEvent<Theme>('teatro:theme', { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/**
 * Sigue al sistema mientras el usuario no haya elegido nada explicitamente.
 * Devuelve el teardown.
 */
export function followSystemTheme(): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');

  const onChange = (): void => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      /* sin almacenamiento, siempre seguimos al sistema */
    }
    if (stored === 'light' || stored === 'dark') return;
    applyTheme(systemTheme(), false);
  };

  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
