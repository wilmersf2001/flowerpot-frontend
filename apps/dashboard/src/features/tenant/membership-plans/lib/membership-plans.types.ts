export interface MembershipPlanRow {
  id: string;
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
}

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
