/**
 * Plan tal como lo consume el sitio público. Mismo origen que el
 * `PlanResource` del backend, pero ya normalizado: números como `number`,
 * `features` como `string[]` y solo los campos que la landing muestra.
 */
export interface PublicPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Ej.: "S/ 99". Viene formateado del backend. */
  priceFormatted: string;
  priceCents: number;
  currency: string;
  /** "monthly" | "yearly" (u otro que agregue el backend). */
  billingPeriod: string;
  maxLocations: number;
  maxMembers: number;
  hasUnlimitedMembers: boolean;
  hasUnlimitedLocations: boolean;
  features: string[];
  sortOrder: number;
}
