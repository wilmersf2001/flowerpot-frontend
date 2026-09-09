import { featureLabel } from "./plans.feature-labels";
import type { PublicPlan } from "./plans.types";

/** El backend serializa todo como string; estas ayudas lo devuelven a JS. */
function toNumber(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    // Puede venir como JSON (`["a","b"]`) o como lista separada por saltos/comas.
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      /* no era JSON */
    }
    return value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * `PlanResource` (crudo, tal como llega en `data[]`) -> `PublicPlan`.
 * Tolerante: cualquier campo ausente cae a un valor neutro.
 */
export function toPublicPlan(raw: Record<string, unknown>): PublicPlan {
  return {
    id: String(raw.id ?? raw.slug ?? crypto.randomUUID()),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    priceFormatted: String(raw.price_formatted ?? ""),
    priceCents: toNumber(raw.price_cents),
    currency: String(raw.currency ?? "PEN"),
    billingPeriod: String(raw.billing_period ?? "monthly"),
    maxLocations: toNumber(raw.max_locations),
    maxMembers: toNumber(raw.max_members),
    hasUnlimitedMembers: toBoolean(raw.has_unlimited_members),
    hasUnlimitedLocations: toBoolean(raw.has_unlimited_locations),
    features: toStringArray(raw.features).map(featureLabel),
    sortOrder: toNumber(raw.sort_order),
  };
}
