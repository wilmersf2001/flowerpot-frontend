import type { BranchAccess } from "./membership-plans.constants";
import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

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
  branch_access?: BranchAccess;
  /** Solo con `branch_access = "limited"`: sedes que el cliente puede elegir. */
  max_branches?: number | null;
  /** Sedes fijas del plan (solo con `branch_access = "specific"`). */
  branches?: { id: number; name: string }[];
  /** Servicios incluidos; `quota` = cupo de usos (`null` = ilimitado). */
  services?: { id: number; name: string; quota: number | null }[];
}

/** Servicio incluido en un plan (cuerpo de `services[]`). */
export interface MembershipPlanServiceInput {
  id: number;
  quota?: number | null;
}

export interface MembershipPlanListParams extends BaseListParams {
  is_active?: "1" | "0";
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type MembershipPlanFilters = ListFilters<MembershipPlanListParams>;

export interface CreateMembershipPlanInput {
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  duration_days: number;
  sort_order?: number | null;
  branch_access: BranchAccess;
  /** Obligatorio con `limited`. */
  max_branches?: number | null;
  /** Obligatorio con `specific`. */
  branches?: number[];
  services?: MembershipPlanServiceInput[];
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
  branch_access?: BranchAccess;
  max_branches?: number | null;
  branches?: number[];
  services?: MembershipPlanServiceInput[];
}
