import type { LeadListParams } from "./leads.types";

/** Fábrica de query-keys de React Query para el módulo de leads. */
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
};
