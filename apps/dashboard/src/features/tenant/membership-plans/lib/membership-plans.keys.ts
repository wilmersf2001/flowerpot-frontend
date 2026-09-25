import { MembershipPlanFilters, MembershipPlanListParams } from "./membership-plans.types";

/** Fábrica de query-keys de React Query para el módulo de planes de membresía. */
export const membershipPlanKeys = {
  all: ["membership-plans"] as const,
  lists: () => [...membershipPlanKeys.all, "list"] as const,
  list: (params: MembershipPlanListParams) =>
    [...membershipPlanKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string, filters: MembershipPlanFilters = {}) =>
    [...membershipPlanKeys.all, "options", filters, search] as const,
};
