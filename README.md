# Teatro del Código — portfolio inmersivo

Un portfolio construido como una obra de teatro en nueve actos. Astro 7,
TypeScript estricto, Tailwind 4 y cero frameworks de UI en el cliente.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build (falla si hay un solo error de tipos)
npm run preview   # sirve dist/ tal y como se desplegará
```

---

## 1. Qué hay que tocar para hacerlo tuyo

Cuatro sitios. Ninguno es un componente.

| Quiero cambiar… | Archivo |
|---|---|
| Nombre, SEO, correo, redes, CV | `src/data/site.ts` |
| Colores, tipografías, espaciado, sombras | `src/styles/tokens.css` |
| Comportamiento de las animaciones | `src/data/theater.config.ts` |
| Proyectos, experiencia, tecnologías, certificaciones, testimonios, servicios | `src/content/*.json` |
| Orden y nombre de los actos | `src/data/navigation.ts` |
| Biografía y principios | `src/data/about.ts` |

Antes de desplegar: cambia `site` en `astro.config.mjs` y el dominio de
`public/robots.txt`.

---

## 2. Arquitectura

```
src/
├── data/            configuración (site · navigation · socials · about · theater.config)
├── content/         contenido en JSON, validado con Zod
├── content.config.ts  esquemas y loaders de las colecciones
├── styles/          tokens.css · global.css · theater.css
├── utils/           cn · format · collections · seo · motion · scroll-effects · theme
├── components/
│   ├── ui/          primitivas sin dominio (Button, Card, Section, SceneTitle, Timeline…)
│   ├── theater/     la metáfora (Curtain, Stage, Spotlight, AnimatedBackground, ProgressRail)
│   ├── cards/       composiciones de dominio (ProjectCard, ServiceCard, TestimonialCard…)
│   └── layout/      cromo de página (Navbar, Footer, ThemeToggle, SkipLink)
├── sections/        los nueve actos: componen, no implementan
├── layouts/         BaseLayout (SEO + a11y + arranque del runtime)
└── pages/           enrutado y nada más
```

**Regla de dependencia:** `pages → sections → cards → ui`. `theater/` es
transversal, `utils/` y `data/` son hojas. Ninguna capa importa hacia arriba.
Es lo que impide que aparezca el componente de 600 líneas: `ProjectsSection`
no sabe maquetar una tarjeta, solo qué acto es y qué datos pide.

**`data/` y `content/` no son lo mismo.** `content/` es contenido validado por
esquema que crece, se ordena y genera rutas (cada proyecto es una página).
`data/` es configuración: cambia el comportamiento del sitio, no su contenido.
Mezclarlos obliga a validar configuración con Zod y a versionar contenido como
si fuera código.

**Las secciones no contienen datos ni saben ordenarlos.** Todo el acceso a
colecciones pasa por `utils/collections.ts`, que también centraliza el criterio
de orden (proyectos por `order` y luego por año; experiencia, del último al
primero) y resuelve las referencias `reference('tech')` con un mapa en lugar de
N consultas.

---

## 3. Decisiones que merecen explicación

### Motion One en vanilla, no Framer Motion
Framer Motion obliga a cargar React como isla: ~45 kB de runtime **solo para
animar**, en un sitio que por lo demás no envía ni un framework. `motion` son
unos pocos kB, usa WAAPI y no necesita ninguno.

### CSS anima, JS decide
El revelado progresivo es una **transición CSS** que se dispara añadiendo una
clase. Un único `IntersectionObserver` para todo el documento, que además hace
`unobserve` tras revelar: el coste tiende a cero según bajas. Cero animaciones
en el hilo principal, cero `requestAnimationFrame` por elemento.

`motion` solo interviene donde CSS no llega: el parallax y la barra de
progreso, ambos ligados al scroll.

### El chunk de `motion` está aislado a propósito
`utils/scroll-effects.ts` existe por una razón de bundling que conviene no
olvidar: `await import('motion')` devuelve el **namespace completo** del
paquete, así que todos sus exports deben existir y el bundler no puede
eliminar nada — el chunk pesaba **132 kB**. Importando de forma estática solo
`scroll` y `animateMini` dentro de un módulo propio, y cargando dinámicamente
ese módulo, el tree-shaking vuelve a funcionar: **21,8 kB** (~8,5 kB gzip).

Y no se descarga nunca si el visitante tiene `prefers-reduced-motion`.

### `unveil` usa máscara, no `clip-path`
`clip-path: inset(0 0 100% 0)` deja el elemento con área visible cero.
IntersectionObserver calcula la intersección sobre la geometría recortada, así
que ese elemento **nunca entra en pantalla**, nunca recibe la clase y nunca se
descubre: el efecto de entrada impide que se dispare su propia entrada. Una
máscara es un efecto de pintado, no un recorte de geometría, y el observador
sigue viendo el elemento.

### Tailwind 4 consume mis variables CSS
`@theme inline { --color-bg: var(--bg); }` hace que `bg-bg` compile a
`var(--bg)` en lugar de copiar el valor. Los design tokens y las utilidades son
literalmente la misma fuente de verdad, y cambiar de tema recolorea todo sin
regenerar una sola clase.

### El acento cambia entre temas
En claro el acento es carmesí; en oscuro, latón. No es un descuido: el oro no
existe sobre papel crema. El tema claro es «el programa de mano», el oscuro es
«la sala a oscuras».

### View Transitions solo entre páginas
Aportan donde hay navegación real: de la portada a un caso de estudio, el
cartel y el título comparten `transition:name` y la imagen **crece** hasta su
nueva posición en vez de parpadear. Dentro de la portada no aportarían nada y
complicarían el ciclo de vida de los observers.

### Los carteles de proyecto se dibujan con CSS
Cero bytes de imagen, cero peticiones, sin CLS (el `aspect-ratio` reserva el
hueco) y se adaptan al tema y al color de cada proyecto. Si algún día hay
fotografías reales, se sustituye `ProjectPoster` por `<Image>` de
`astro:assets` sin tocar `ProjectCard`.

### Aquí NO se usa `content-visibility: auto`
Ahorraría algo de layout inicial, pero introduce alturas estimadas en secciones
que son el destino de los anclajes del menú. Un salto de scroll al pulsar
«Proyectos» es un fallo visible; el ahorro, en una portada de HTML estático,
no lo es.

---

## 4. Accesibilidad

- **Mejora progresiva real.** El contenido solo se oculta si
  `<html data-motion="on">`, atributo que pone el script inline del `<head>`
  únicamente cuando hay JS **y** el usuario no ha pedido reducir el
  movimiento. Sin JS o con `prefers-reduced-motion`, todo nace visible.
  *Verificado: 0 de 77 elementos ocultos con JS desactivado.*
- **`prefers-reduced-motion` desactiva, no ralentiza.** El telón no se dibuja,
  no se registra ningún observer decorativo y el chunk de `motion` no se
  descarga.
- El reflector vive **detrás** del contenido. Una capa translúcida sobre el
  texto alteraría su contraste (WCAG 1.4.3); iluminando solo el fondo, el
  efecto se nota y el contraste queda intacto.
- Skip link, `<main tabindex="-1">`, nueve regiones con `aria-labelledby`,
  `aria-current` en el acto en curso, un solo anillo de foco visible en ambos
  temas.
- Si hay `href` se renderiza `<a>`; si no, `<button>`. Nunca un `div` con un
  manejador de clic.
- Tarjetas con enlace extendido: **un** destino en el orden de tabulación y un
  nombre accesible real, no «enlace, tarjeta».
- El estado y el nivel se comunican con texto, no solo con color.
- Contraste verificado AA en ambos temas (texto 15:1 · secundario 7,6:1 ·
  terciario 5,5:1).

---

## 5. Rendimiento

| Recurso (home, gzip) | Peso |
|---|---|
| HTML | ~33 kB |
| CSS | ~13 kB |
| JS crítico | ~2 kB |
| `motion` (diferido, condicional) | ~8,5 kB |
| Iconos | 0 kB — SVG inyectado en build |
| Imágenes | 0 kB — carteles generados con CSS |

- Sin frameworks de UI en el cliente.
- Fuentes variables autoalojadas, con `preload` del subconjunto latino y
  partición por `unicode-range`: solo se descarga lo que se usa.
- El tema se aplica antes del primer pintado con un script inline bloqueante —
  el único de la página, y está justificado: cualquier alternativa asíncrona
  produce un destello blanco en modo oscuro.
- El estado del header lo decide un centinela de 1 px con
  IntersectionObserver, no un listener de scroll.
- El desenfoque del header solo aparece al desplazarse, para no compositar una
  capa borrosa durante el primer pintado.

---

## 6. Contenido

Los seis JSON de `src/content/` pasan por esquemas Zod (`src/content.config.ts`).
Consecuencias prácticas:

1. `entry.data` llega **tipado** a los componentes, sin `any` ni castings.
2. Un dato mal escrito rompe el **build**, no la página en producción.
3. `reference('tech')` valida que cada tecnología citada por un proyecto exista
   de verdad: un id con una errata no llega nunca a desplegarse.

Añadir un proyecto = añadir un objeto a `projects.json`. Se genera su página de
detalle, entra en el sitemap, aparece en la portada y el contador del hero sube
solo.

---

## 7. Pendientes antes de publicar

- [ ] `site` en `astro.config.mjs` y el dominio en `public/robots.txt`
- [ ] Datos reales en `src/data/site.ts` y `src/data/about.ts`
- [ ] Tu contenido en `src/content/*.json`
- [ ] `public/cv.pdf` y `author.cvUrl` en `site.ts` (si quieres el botón)
- [ ] `contact.formEndpoint` en `site.ts` para activar el formulario — sin él
      solo se muestra el correo, que es preferible a un formulario que no envía
- [ ] Regenerar `public/og/portada.png` desde `scripts/og-template.html`
      (captura a 1200×630)

## 8. Estructura de una sección nueva

```astro
---
import Section from '@components/ui/Section.astro';
---
<Section id="mi-acto" lead="Una frase que sitúa al lector.">
  <!-- solo contenido: el ritmo, el contenedor y la cabecera vienen dados -->
</Section>
```

Añade el acto a `ACTS` en `src/data/navigation.ts` y aparecerá en el menú, en
el pie y en el scroll-spy. No hay nada más que registrar.
