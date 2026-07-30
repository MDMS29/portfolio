/**
 * Enlaces sociales. `icon` usa la sintaxis de Iconify (`coleccion:nombre`)
 * y se resuelve en build desde @iconify-json/simple-icons o /lucide.
 */

export interface SocialLink {
  id: string;
  label: string;
  /** Texto para lectores de pantalla, mas explicito que la etiqueta visible. */
  a11yLabel: string;
  href: string;
  icon: string;
  /** Se muestra en la barra compacta del hero. */
  primary: boolean;
}

export const SOCIALS: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    a11yLabel: 'Ver mi código en GitHub (se abre en una pestaña nueva)',
    href: 'https://github.com/MDMS29',
    icon: 'simple-icons:github',
    primary: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    a11yLabel: 'Ver mi perfil profesional en LinkedIn (se abre en una pestaña nueva)',
    href: 'https://linkedin.com/in/tu-usuario',
    icon: 'simple-icons:linkedin',
    primary: true,
  },
  {
    id: 'x',
    label: 'X',
    a11yLabel: 'Seguirme en X (se abre en una pestaña nueva)',
    href: 'https://x.com/tu-usuario',
    icon: 'simple-icons:x',
    primary: true,
  },
  {
    id: 'email',
    label: 'Email',
    a11yLabel: 'Escribirme un correo electrónico',
    href: 'mailto:hola@tu-dominio.com',
    icon: 'lucide:mail',
    primary: false,
  },
];

export const PRIMARY_SOCIALS: SocialLink[] = SOCIALS.filter((link) => link.primary);
