/**
 * Sesión del panel: el token de Sanctum que devuelve la API vive SOLO en una
 * cookie httpOnly puesta por el BFF (`/api/auth/login`). El navegador nunca lo
 * lee; `proxy.ts` solo comprueba su presencia.
 *
 * Hay una cookie de sesión POR panel para que estar logueado en el panel
 * central no dé acceso al de un gimnasio y viceversa:
 *
 *   central -> `session`
 *   tenant  -> `tenant_session`
 */

export type PanelKind = "central" | "tenant";

/** Nombre de la cookie httpOnly con el token, por panel. */
export const SESSION_COOKIES: Record<PanelKind, string> = {
  central: process.env.SESSION_COOKIE_NAME ?? "session",
  tenant: process.env.TENANT_SESSION_COOKIE_NAME ?? "tenant_session",
};

/**
 * Cookie LEGIBLE por JS con el slug del gimnasio actual. La pone `proxy.ts` a
 * partir del subdominio y la lee `@repo/api-client` para mandar `X-Tenant`.
 * No es sensible (es el mismo slug que va en la URL).
 */
export const TENANT_SLUG_COOKIE = "tenant";

const isProd = process.env.NODE_ENV === "production";
const WEEK = 60 * 60 * 24 * 7;

/** Opciones para la cookie httpOnly de sesión (token). */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: WEEK,
} as const;

/** Opciones para la cookie legible `tenant` (solo el slug). */
export const tenantSlugCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: WEEK,
} as const;
