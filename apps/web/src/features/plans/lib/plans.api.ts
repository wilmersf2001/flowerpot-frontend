// Solo se importa desde Server Components. `API_INTERNAL_URL` no lleva prefijo
// `NEXT_PUBLIC_`, así que Next nunca lo incluye en el bundle del cliente.
import { toPublicPlan } from "./plans.mapper";
import { FALLBACK_PLANS } from "./plans.fallback";
import type { PublicPlan } from "./plans.types";

/**
 * `GET /plans` es público (no requiere tenant ni sesión), así que el sitio
 * lo consulta directo contra Laravel desde el servidor, sin pasar por el BFF
 * proxy del dashboard. El navegador nunca ve esta URL.
 */
const API_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api";

/** Extrae el array de filas venga con sobre `{ data }` o crudo. */
function pickRows(body: unknown): Record<string, unknown>[] {
  const node =
    body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body;
  const rows =
    node && typeof node === "object" && "data" in node
      ? (node as { data: unknown }).data
      : node;
  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}

/**
 * Lista de planes para la sección de precios, ordenada por `sortOrder`.
 * Si la API falla (caída, timeout, 5xx) devuelve `FALLBACK_PLANS` para que la
 * página nunca quede sin precios.
 */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  try {
    const res = await fetch(`${API_BASE}/plans?per_page=50`, {
      headers: { Accept: "application/json" },
      // Revalida cada 5 min: los planes cambian poco y evita golpear la API.
      next: { revalidate: 300 },
    });
    if (!res.ok) return FALLBACK_PLANS;

    const plans = pickRows(await res.json())
      .map(toPublicPlan)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return plans.length > 0 ? plans : FALLBACK_PLANS;
  } catch {
    return FALLBACK_PLANS;
  }
}
