import { type NextRequest, NextResponse } from "next/server";
import { resolvePanelFromHost } from "@/lib/domain";
import {
  SESSION_COOKIES,
  TENANT_SLUG_COOKIE,
  sessionCookieOptions,
  tenantSlugCookieOptions,
} from "@/lib/session";

/**
 * BFF de logout. Invalida el token en la API (best-effort) y borra la cookie de
 * sesión del panel correspondiente pase lo que pase.
 *
 *   panel central -> POST /admin/logout
 *   panel tenant  -> POST /auth/logout   (+ cabecera `X-Tenant: <slug>`)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const panel = resolvePanelFromHost(request.headers.get("host"));
  const token = request.cookies.get(SESSION_COOKIES[panel.kind])?.value;
  const apiUrl = process.env.API_INTERNAL_URL;
  const endpoint =
    panel.kind === "tenant" ? "/auth/logout" : "/admin/logout";

  if (token && apiUrl) {
    const apiHeaders: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (panel.kind === "tenant") apiHeaders["X-Tenant"] = panel.slug;

    try {
      await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: apiHeaders,
        cache: "no-store",
      });
    } catch {
      // Da igual: igualmente limpiamos la cookie abajo.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIES[panel.kind], "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  if (panel.kind === "tenant") {
    response.cookies.set(TENANT_SLUG_COOKIE, "", {
      ...tenantSlugCookieOptions,
      maxAge: 0,
    });
  }
  return response;
}
