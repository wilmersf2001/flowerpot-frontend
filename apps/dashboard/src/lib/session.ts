/**
 * Sesión del panel: el token de Sanctum que devuelve la API vive SOLO en una
 * cookie httpOnly puesta por el BFF (`/api/auth/login`). El navegador nunca lo
 * lee; `proxy.ts` solo comprueba su presencia.
 */

/** Nombre de la cookie httpOnly con el token. */
export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "session";

/** Opciones compartidas para escribir/borrar la cookie de sesión. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 días
} as const;
