// Solo se importa desde Server Components. Lectura pura de `/public/promotion`.
const API_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api";

export interface PublicPromotion {
  code: string;
  name: string;
  description: string;
  /** Ej.: "30% OFF" o "S/ 50 OFF" (viene formateado del backend si existe). */
  discountLabel: string;
  validUntil: string | null;
  /** IDs de planes a los que aplica; vacío = todos. */
  applicablePlans: string[];
}

function discountLabel(raw: Record<string, unknown>): string {
  if (raw.discount_formatted) return String(raw.discount_formatted);
  const value = Number(raw.discount_value);
  if (!Number.isFinite(value) || value <= 0) return "";
  return raw.discount_type === "percentage"
    ? `${value}% OFF`
    : `S/ ${(value / 100).toFixed(0)} OFF`;
}

/**
 * Promoción vigente para mostrar en la sección de planes (cache del backend:
 * 1 min). Devuelve `null` si no hay ninguna o si la API falla.
 */
export async function getActivePromotion(): Promise<PublicPromotion | null> {
  try {
    const res = await fetch(`${API_BASE}/public/promotion`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const body: unknown = await res.json();
    const raw =
      body && typeof body === "object" && "data" in body
        ? (body as { data: unknown }).data
        : body;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

    const p = raw as Record<string, unknown>;
    const code = String(p.code ?? "").trim();
    const label = discountLabel(p);
    if (!code || !label) return null;

    const until = typeof p.valid_until === "string" ? p.valid_until : null;
    if (until && Date.parse(until) < Date.now()) return null;

    return {
      code,
      name: String(p.name ?? "").trim(),
      description: String(p.description ?? "").trim(),
      discountLabel: label,
      validUntil: until,
      applicablePlans: Array.isArray(p.applicable_plans)
        ? p.applicable_plans.map(String)
        : [],
    };
  } catch {
    return null;
  }
}
