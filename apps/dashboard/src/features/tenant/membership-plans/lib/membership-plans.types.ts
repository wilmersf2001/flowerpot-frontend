export interface MembershipPlanRow {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  price_formatted: string;
  currency: string;
  duration_days: number;
  duration_label: string;
  is_active: boolean;
  sort_order: number;
}

export interface MembershipPlanListParams {
  page?: number;
  perPage?: number;
  search?: string;
  is_active?: "1" | "0";
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type MembershipPlanFilters = Omit<
  MembershipPlanListParams,
  "page" | "perPage" | "search"
>;

export interface CreateMembershipPlanInput {
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  duration_days: number;
  sort_order?: number | null;
}

/**
 * Cuerpo de `PATCH /membership-plans/{id}` (`UpdateMembershipPlanRequest`). El
 * backend NO deja cambiar `currency`; a cambio acepta `is_active`.
 */
export interface UpdateMembershipPlanInput {
  name?: string;
  description?: string | null;
  price_cents?: number;
  duration_days?: number;
  is_active?: boolean;
  sort_order?: number | null;
}
