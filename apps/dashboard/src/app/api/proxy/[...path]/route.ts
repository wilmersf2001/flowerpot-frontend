/**
 * BFF proxy: única puerta del navegador hacia la API de Laravel.
 *
 *   navegador  ──fetch("/api/proxy/…")──▶  este handler  ──▶  API_INTERNAL_URL
 *
 * Por qué existe: el token de Sanctum vive en una cookie httpOnly puesta en el
 * host del dashboard (`admin.localhost:3001`). El navegador NO manda esa cookie
 * a `localhost:8000` (otro host), así que las llamadas directas irían sin auth.
 * Aquí, mismo origen ⇒ la cookie llega, y este handler la reenvía como
 * `Authorization: Bearer <token>`.
 *
 * Además inyecta `X-Tenant` según el panel (subdominio), que es la fuente de
 * verdad — nunca confiamos en el `X-Tenant` que mande el cliente.
 *
 * El `apiClient` de `@repo/api-client` apunta a `/api/proxy` vía
 * `NEXT_PUBLIC_API_URL`, por lo que `apiClient.get("/tenants")` termina aquí
 * como `/api/proxy/tenants`.
 */
import { type NextRequest, NextResponse } from "next/server";
import { resolvePanelFromHost } from "@/lib/domain";
import { SESSION_COOKIES } from "@/lib/session";

/** Cabeceras del cliente que sí reenviamos a Laravel. El resto se descarta. */
const FORWARD_REQUEST_HEADERS = ["content-type", "accept"];

/** Cabeceras de Laravel que NO devolvemos al cliente. */
const STRIP_RESPONSE_HEADERS = new Set([
  "set-cookie",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  "connection",
]);

async function handler(
  request: NextRequest,
  ctx: RouteContext<"/api/proxy/[...path]">,
): Promise<Response> {
  const apiBase = process.env.API_INTERNAL_URL;
  if (!apiBase) {
    return NextResponse.json(
      { message: "API_INTERNAL_URL no está configurada." },
      { status: 500 },
    );
  }

  const { path } = await ctx.params;
  const panel = resolvePanelFromHost(request.headers.get("host"));
  const token = request.cookies.get(SESSION_COOKIES[panel.kind])?.value;

  const target = `${apiBase.replace(/\/$/, "")}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("accept")) headers.set("accept", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (panel.kind === "tenant") headers.set("x-tenant", panel.slug);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo contactar con la API." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
