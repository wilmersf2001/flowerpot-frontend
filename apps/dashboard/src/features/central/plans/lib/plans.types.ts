import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface CreatePlanInput {
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_period: string;
  max_locations: number;
  max_members: number;
  features: string[];
  sort_order: number;
}

/**
 * Cuerpo de `PUT /plans/{plan}` (`UpdatePlanRequest`). El backend NO deja
 * cambiar `slug`, `currency` ni `billing_period`; a cambio acepta `is_active`.
 * Todos los campos son opcionales.
 */
export interface UpdatePlanInput {
  name?: string;
  description?: string;
  price_cents?: number;
  max_locations?: number;
  max_members?: number;
  features?: string[];
  is_active?: boolean;
  sort_order?: number;
}

export type PlanListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type PlanFilters = ListFilters<PlanListParams>;

export interface PlanRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  price_formatted: string;
  currency: string;
  billing_period: string;
  max_locations: number;
  max_members: number;
  has_unlimited_members: boolean;
  has_unlimited_locations: boolean;
  features: string[];
  is_active: boolean;
  sort_order: number;
}
