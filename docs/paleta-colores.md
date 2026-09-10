# Paleta de colores y sistema de marca

> Última actualización: 2026-09-10
> Dirección de marca: **Iron & Lime** (nacida en `apps/web`, extendida a `apps/dashboard`).

---

## 1. Cómo están organizados los tokens

Hay tres capas, de abajo hacia arriba. Cada capa solo puede *ajustar* lo que
define la anterior — nunca hay un color suelto (hex, `bg-emerald-500`, etc.)
escrito directo en una pantalla de feature.

```
packages/config/tailwind/theme.css   → tokens base (shadcn-style), light + .dark
        ↓ @import
apps/web/src/app/globals.css         → re-tematiza SOLO .dark → "Iron & Lime" oscuro
apps/dashboard/src/app/globals.css   → re-tematiza :root Y .dark → "Iron & Lime" claro/oscuro
        ↓ @theme inline (var(--x))
Tailwind utilities: bg-primary, text-muted-foreground, border-border, etc.
```

**Regla de oro:** en código de feature (`features/**`, `app/**`) solo se usan
las clases semánticas (`bg-primary`, `text-muted-foreground`, `border-border`,
`bg-sidebar-accent`…) o el componente `Badge` con su prop `tone`. Nunca
`bg-emerald-100`, `text-indigo-700`, ni un `#hex` suelto — eso es exactamente
lo que rompía la paleta en `apps/dashboard/src/app/login/page.tsx` antes de
esta pasada (colores de Tailwind hardcodeados que ignoraban el tema y no
tenían variante oscura).

Si necesitas un color semántico nuevo (por ejemplo un badge de tono "info"),
se agrega como variante en `packages/ui/src/components/badge.tsx`, no como
clase suelta en el feature.

---

## 2. Por qué dos direcciones (web vs. dashboard)

- **`apps/web` (landing pública):** siempre oscuro (`<html class="dark">`
  fijo). Es la vitrina, puede permitirse un acento de neón (lima) sobre
  grafito casi negro.
- **`apps/dashboard` (panel central + panel del gimnasio):** herramienta de
  trabajo, se usa horas y cambia entre claro/oscuro/sistema
  (`ThemeToggle` + `theme-provider.tsx`). Necesita contraste cómodo en
  ambos modos, así que el lima puro solo aparece como acento — el modo claro
  usa una variante de esmeralda más profunda para tener contraste legible
  sobre blanco.

Ambos comparten la misma esencia: grafito con un tinte verdoso (nunca gris
puro) + un verde de marca (esmeralda/lima) usado con moderación + tipografía
Archivo condensada para títulos.

---

## 3. Tipografía

| Uso | Fuente | Dónde |
|---|---|---|
| Texto corrido, UI, formularios, tablas | **Geist Sans** (`--font-geist-sans`) | Todas las apps |
| Código / datos monoespaciados | **Geist Mono** (`--font-geist-mono`) | Todas las apps |
| Titulares y etiquetas de marca | **Archivo** (`--font-display`), variable font con eje `wdth` | `apps/web` y `apps/dashboard` |

Dos clases utilitarias, definidas **una sola vez** en
`packages/config/tailwind/theme.css` (junto a `--font-sans`/`--font-mono`) y
heredadas por ambas apps — no se redefinen en `apps/web` ni en
`apps/dashboard`:

- `.display-heading` — Archivo 800, `font-stretch: 82%`, mayúsculas,
  tracking negativo, line-height apretado. Para H1 de pantalla y titulares
  hero.
- `.display-label` — Archivo 700, `font-stretch: 82%`, mayúsculas,
  tracking `0.14em`. Para eyebrows, badges de marca, subtítulos de panel.

En el dashboard se usan en el wordmark del sidebar/topbar y en
`ResourceHeader` (el H1 de cada pantalla de recurso), **no** en cuerpo de
texto ni en celdas de tabla — ahí la legibilidad manda y se queda con Geist.

---

## 4. Tokens — modo claro

Compartido por `packages/config/tailwind/theme.css` y afinado por
`apps/dashboard/src/app/globals.css` (`:root`). `apps/web` no tiene modo
claro (sitio siempre oscuro).

| Token | Valor (oklch) | Rol |
|---|---|---|
| `--background` | `0.99 0.004 145` | Fondo de página — blanco con un dejo verde-grafito, no blanco puro |
| `--foreground` | `0.18 0.01 145` | Texto principal |
| `--card` / `--popover` | `1 0.002 145` | Superficies elevadas |
| `--primary` | `0.58 0.15 155` | Esmeralda de marca — botones, links, foco, cifras destacadas |
| `--primary-foreground` | `0.99 0 0` | Texto sobre `--primary` |
| `--secondary` / `--muted` | `0.955 0.006 150` | Superficies y fondos secundarios |
| `--muted-foreground` | `0.5 0.012 145` | Texto secundario |
| `--accent` | `0.93 0.03 128` | Hover / realce sutil, guiño al lima de la landing |
| `--border` / `--input` | `0.9 0.008 150` | Líneas y bordes |
| `--destructive` | `0.577 0.245 27.325` | Errores (heredado del preset) |
| `--sidebar-accent` | `0.91 0.035 128` | Item de navegación activo (lima suave) |

## 5. Tokens — modo oscuro

`apps/web` (`.dark`, fijo) y `apps/dashboard` (`.dark`, vía toggle) comparten
la misma dirección "grafito + lima eléctrico"; el dashboard la retoca un
poco (superficies un punto más claras) para que las filas de tabla se
distingan entre sí.

| Token | Valor (oklch) | Rol |
|---|---|---|
| `--background` | `0.16 0.006 130` | Grafito casi negro (nunca negro puro) |
| `--foreground` | `0.96 0.008 110` | Texto principal |
| `--card` | `0.20 0.006 130` (web: `0.19`) | Superficies elevadas / filas |
| `--primary` | `0.85 0.19 124` (web: `0.9 0.19 122`) | **Lima eléctrico** — úsese poco: CTA, cifras, 1 acento por sección |
| `--primary-foreground` | `0.16 0.006 130` | Texto sobre `--primary` |
| `--secondary` / `--muted` | `0.26 0.008 130` | Superficies secundarias |
| `--muted-foreground` | `0.7 0.012 120` | Texto secundario |
| `--border` / `--input` | `oklch(1 0 0 / 10%)` / `15%` | Hairlines translúcidos sobre el grafito |
| `--sidebar-accent` | `0.28 0.025 124` | Item de navegación activo |

**Regla de uso del lima:** es el color más saturado del sistema — se reserva
para foco/acento (CTA primario, badge de marca, indicador activo, cifra
destacada). No se usa como color de fondo grande ni de texto de párrafo:
por eso `--primary-foreground` en oscuro es grafito, no blanco.

---

## 6. Gráficos (`--chart-1`…`--chart-5`)

Antes eran los colores por defecto de shadcn (naranja/azul random, sin
relación con la marca). Ahora derivan de la misma familia:

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--chart-1` | esmeralda `0.58 0.15 155` | lima `0.85 0.19 124` | Serie principal |
| `--chart-2` | lima `0.75 0.19 122` | esmeralda `0.6 0.14 163` | Serie secundaria |
| `--chart-3` | azul acero `0.55 0.1 220` | azul acero `0.65 0.12 220` | Contraste / comparación |
| `--chart-4` | ámbar `0.7 0.15 70` | ámbar `0.75 0.15 70` | Alertas dentro de gráficos |
| `--chart-5` | grafito-verde `0.45 0.05 145` | grafito-verde `0.55 0.02 130` | Serie de relleno / baseline |

---

## 7. Archivos que tocar

| Quiero… | Archivo |
|---|---|
| Cambiar un color de marca (claro u oscuro) del dashboard | `apps/dashboard/src/app/globals.css` |
| Cambiar el oscuro de la landing pública | `apps/web/src/app/globals.css` |
| Cambiar un token base compartido, `.display-heading`/`.display-label`/`.bg-brand-glow`, o radios/tipografía sans-mono | `packages/config/tailwind/theme.css` |
| Agregar un tono nuevo de `Badge` | `packages/ui/src/components/badge.tsx` |
| Usar el titular de marca en una pantalla nueva | clase `.display-heading` / `.display-label` (ya disponible en cualquier app, sin importar nada extra) |

No dupliques un color: si necesitas "el verde de marca", usa `bg-primary` /
`text-primary`, no adivines el oklch a mano.
