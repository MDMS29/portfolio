/**
 * Formateo de fechas y cifras. Todo se ejecuta en BUILD (los componentes
 * .astro son server-only), asi que `Intl` no cuesta ni un byte al cliente.
 */

import { SITE } from '@data/site';

const LOCALE = SITE.lang;

const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'short', year: 'numeric' });
const longMonthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });

/** Convierte "2024-05" en un Date en UTC (evita saltos por zona horaria). */
function parseYearMonth(value: string): Date {
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, 1));
}

/** "2024-05" -> "may 2024" */
export function formatMonth(value: string, long = false): string {
  const formatter = long ? longMonthYear : monthYear;
  return formatter.format(parseYearMonth(value)).replace(/\.$/, '');
}

/** Valor para el atributo `datetime` de <time>. */
export function toDateTimeAttr(value: string): string {
  return value;
}

/** "2023-02" + null -> "feb 2023 — actualidad" */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : 'actualidad'}`;
}

/**
 * Duracion legible entre dos meses. `end` nulo se resuelve contra la fecha
 * de build, que es exactamente lo que queremos en un sitio estatico.
 */
export function formatDuration(start: string, end: string | null): string {
  const from = parseYearMonth(start);
  const to = end ? parseYearMonth(end) : new Date();

  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()) + 1;

  const years = Math.floor(months / 12);
  const rest = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? 'mes' : 'meses'}`);

  return parts.join(' y ') || '1 mes';
}

/** Numero de dos digitos para la numeracion de escenas: 1 -> "01". */
export function padIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** Convierte un id de coleccion en texto legible: "design-system" -> "Design system". */
export function humanize(id: string): string {
  const spaced = id.replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
