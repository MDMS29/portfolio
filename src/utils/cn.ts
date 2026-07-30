/**
 * Une clases condicionales sin dependencias.
 *
 * Deliberadamente NO resuelve conflictos de Tailwind (eso exigiria
 * `tailwind-merge`, ~7 kB). El patron del proyecto es distinto: los
 * componentes exponen `variant`/`size` y aceptan `class` como ADICION,
 * no como sustitucion. Si hiciera falta ganar una batalla de especificidad,
 * la respuesta correcta es una variante nueva, no un merge en runtime.
 */
export type ClassValue = string | number | false | null | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(' ');
}
