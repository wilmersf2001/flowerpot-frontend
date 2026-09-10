/**
 * Configuración única del sitio público. Todo lo que dependa del dominio o de
 * URLs absolutas (SEO, Open Graph, sitemap, robots, JSON-LD) sale de aquí.
 *
 * En local/CI basta con los valores por defecto. En producción se define
 * `NEXT_PUBLIC_SITE_URL` (y opcionalmente `NEXT_PUBLIC_ADMIN_URL`) y el resto
 * se arma solo.
 */

/** URL canónica del sitio, SIN barra final. Ej.: `https://flowerpot.pe`. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** URL del panel de administración (login del dashboard). */
export const ADMIN_URL = (
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export const SITE_NAME = "Flowerpot";

/** Título por defecto (home). Las páginas internas usan el `template`. */
export const SITE_TITLE = "Flowerpot — Software de gestión para gimnasios";

export const SITE_DESCRIPTION =
  "Administra socios, membresías, pagos y asistencia de tu gimnasio en Perú. Multi-sede, datos cifrados y soporte 24/7.";

export const SITE_LOCALE = "es_PE";

/** Palabras clave de referencia (Google las ignora, pero documentan el foco). */
export const SITE_KEYWORDS = [
  "software para gimnasios",
  "sistema de gestión de gimnasios",
  "software de gimnasio Perú",
  "control de acceso gimnasio",
  "membresías gimnasio",
  "cobros gimnasio Yape",
  "gestión multi-sede gimnasio",
];

/** Construye una URL absoluta a partir de una ruta relativa (`/seguridad`). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
