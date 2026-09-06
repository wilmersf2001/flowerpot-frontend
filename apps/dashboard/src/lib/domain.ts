/**
 * Resuelve, a partir del host de la petición, a qué panel corresponde:
 *
 *   admin.<ROOT_DOMAIN>   -> panel central (SaaS)
 *   <slug>.<ROOT_DOMAIN>  -> panel del gimnasio "<slug>"
 *   sin subdominio / www  -> panel central (fallback cómodo para dev)
 *
 * Es un módulo PURO (sin `next/headers`, sin estado) para poder importarlo
 * tanto desde `proxy.ts` como desde los route handlers del BFF.
 *
 * En local usa `ROOT_DOMAIN=localhost` y entra por `admin.localhost:3001` /
 * `gymfit.localhost:3001` (los navegadores resuelven `*.localhost` solos).
 */

export type PanelTarget = { kind: "central" } | { kind: "tenant"; slug: string };

/** Subdominio reservado para el panel central. Cambia esto y actualiza el DNS. */
export const CENTRAL_SUBDOMAIN = "admin";

/** Subdominios que nunca son un gimnasio; se tratan como panel central. */
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "assets",
  "static",
  "cdn",
  "mail",
]);

const ROOT_DOMAIN = (process.env.ROOT_DOMAIN ?? "localhost").toLowerCase();

/**
 * Devuelve la etiqueta de subdominio (`gymfit` en `gymfit.flowerpot.pe`), o
 * `null` si el host es el dominio raíz, `www.` o algo que no cuelga de él.
 */
export function getSubdomain(host: string | null | undefined): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0]!.toLowerCase(); // quita el puerto
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;

  const suffix = `.${ROOT_DOMAIN}`;
  if (!hostname.endsWith(suffix)) return null;

  const label = hostname.slice(0, -suffix.length);
  // Solo subdominios de un nivel: `gymfit`, no `a.b`.
  if (!label || label.includes(".")) return null;

  return label;
}

/** Decide el panel a partir del host de la petición. */
export function resolvePanelFromHost(
  host: string | null | undefined,
): PanelTarget {
  const sub = getSubdomain(host);

  if (sub === null) {
    // Sin subdominio (p. ej. `localhost:3001`): fallback de desarrollo.
    if (process.env.DEV_PANEL === "tenant") {
      return { kind: "tenant", slug: process.env.DEV_TENANT ?? "demo" };
    }
    return { kind: "central" };
  }

  if (sub === CENTRAL_SUBDOMAIN || RESERVED_SUBDOMAINS.has(sub)) {
    return { kind: "central" };
  }

  return { kind: "tenant", slug: sub };
}
