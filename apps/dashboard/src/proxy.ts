import { type NextRequest, NextResponse } from "next/server";
import { resolvePanelFromHost } from "@/lib/domain";
import {
  SESSION_COOKIES,
  TENANT_SLUG_COOKIE,
  tenantSlugCookieOptions,
  type PanelKind,
} from "@/lib/session";

/**
 * apps/dashboard es UNA app Next.js que sirve DOS paneles según el subdominio:
 *
 *   admin.<ROOT_DOMAIN>   -> route group (central)  — dueño del SaaS
 *   {gym}.<ROOT_DOMAIN>   -> route group (tenant)   — cada gimnasio
 *
 * Este proxy hace tres cosas en cada request:
 *   1. Resuelve el panel desde el host y lo pasa a la app por cabeceras
 *      (`x-panel`, `x-tenant-slug`) + deja la cookie legible `tenant`.
 *   2. Guard de sesión: sin la cookie httpOnly del panel -> `/login`.
 *   3. Evita cruzar de panel (una ruta de gimnasio en el subdominio admin, etc.).
 */

/** A dónde se manda al usuario recién logueado, por panel. */
const AFTER_LOGIN: Record<PanelKind, string> = {
  central: "/tenants",
  tenant: "/members",
};

/** Rutas que pertenecen a cada panel (route groups `(central)` / `(tenant)`). */
const CENTRAL_PREFIXES = ["/tenants", "/plans", "/subscriptions", "/gym-settings"];
const TENANT_PREFIXES = [
  "/members",
  "/memberships",
  "/payments",
  "/attendance",
  "/check-in",
  "/staff",
  "/branches",
  "/cash-register",
];

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const panel = resolvePanelFromHost(req.headers.get("host"));
  const kind: PanelKind = panel.kind;

  const hasSession = req.cookies.has(SESSION_COOKIES[kind]);
  const isLogin = pathname === "/login";

  // --- 1. Propagar el panel a la app por cabeceras de request. ---
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-panel", kind);
  if (panel.kind === "tenant") {
    requestHeaders.set("x-tenant-slug", panel.slug);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  const withPanel = (res: NextResponse): NextResponse => {
    // Cookie legible con el slug (o borrarla en el panel central).
    if (panel.kind === "tenant") {
      res.cookies.set(TENANT_SLUG_COOKIE, panel.slug, tenantSlugCookieOptions);
    } else {
      res.cookies.set(TENANT_SLUG_COOKIE, "", {
        ...tenantSlugCookieOptions,
        maxAge: 0,
      });
    }
    return res;
  };

  const redirectTo = (to: string): NextResponse => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    return withPanel(NextResponse.redirect(url));
  };

  // --- 2. Guard de sesión. ---
  if (!hasSession && !isLogin) return redirectTo("/login");
  if (hasSession && isLogin) return redirectTo(AFTER_LOGIN[kind]);

  // --- 3. Con sesión: no cruzar de panel y aterrizar "/" donde toca. ---
  if (hasSession) {
    const crossPanel =
      (kind === "central" && matchesPrefix(pathname, TENANT_PREFIXES)) ||
      (kind === "tenant" && matchesPrefix(pathname, CENTRAL_PREFIXES));
    if (pathname === "/" || crossPanel) return redirectTo(AFTER_LOGIN[kind]);
  }

  return withPanel(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  // Todo excepto los route handlers (/api), internos de Next y estáticos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
