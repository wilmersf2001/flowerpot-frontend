import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * apps/dashboard es UNA app Next.js que servirá DOS paneles por subdominio:
 *
 *   admin.flowerpot.pe   -> route group (central)  — dueño del SaaS
 *   {gym}.flowerpot.pe   -> route group (tenant)   — cada gimnasio
 *
 * El ruteo por subdominio y la cookie `tenant` siguen pendientes (M1). Lo que
 * ya está activo aquí es el guard de sesión: sin cookie httpOnly de sesión no
 * se entra a ninguna ruta salvo `/login`.
 */

/** Rutas accesibles sin sesión. */
const PUBLIC_PATHS = new Set<string>(["/login"]);

/** Destino tras iniciar sesión (primer ítem del panel central). */
const AFTER_LOGIN_PATH = "/tenants";

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.has(pathname);

  // Sin sesión -> al login.
  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión, no tiene sentido volver al login.
  if (hasSession && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = AFTER_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Todo excepto los route handlers (/api), internos de Next y estáticos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
