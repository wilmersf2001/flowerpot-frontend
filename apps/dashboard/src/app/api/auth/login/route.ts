import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePanelFromHost } from "@/lib/domain";
import {
  SESSION_COOKIES,
  TENANT_SLUG_COOKIE,
  sessionCookieOptions,
  tenantSlugCookieOptions,
} from "@/lib/session";

/**
 * BFF de login. Según el subdominio por el que entró el navegador:
 *
 *   panel central -> POST /admin/login
 *   panel tenant  -> POST /auth/login   (+ cabecera `X-Tenant: <slug>`)
 *
 * Si la API responde OK, guarda el token de Sanctum en la cookie httpOnly del
 * panel correspondiente. El token nunca llega al navegador.
 */

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Datos inválidos.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const apiUrl = process.env.API_INTERNAL_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "API no configurada (falta API_INTERNAL_URL)." },
      { status: 500 },
    );
  }

  const panel = resolvePanelFromHost(request.headers.get("host"));
  const endpoint =
    panel.kind === "tenant" ? "/auth/login" : "/admin/login";

  const apiHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (panel.kind === "tenant") apiHeaders["X-Tenant"] = panel.slug;

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor." },
      { status: 502 },
    );
  }

  const body = (await apiRes.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
    data?: { token?: string };
  } | null;

  if (!apiRes.ok) {
    return NextResponse.json(
      {
        message: body?.message ?? "No se pudo iniciar sesión.",
        errors: body?.errors,
      },
      { status: apiRes.status },
    );
  }

  const token = body?.data?.token;
  if (!token) {
    return NextResponse.json(
      { message: "Respuesta de login inesperada." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIES[panel.kind], token, sessionCookieOptions);
  if (panel.kind === "tenant") {
    response.cookies.set(TENANT_SLUG_COOKIE, panel.slug, tenantSlugCookieOptions);
  }
  return response;
}
