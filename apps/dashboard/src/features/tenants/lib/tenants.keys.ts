import type { TenantListParams } from "./tenants.types";

/** Fábrica de query-keys de React Query para el módulo de gimnasios. */
export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (params: TenantListParams) =>
    [...tenantKeys.lists(), params] as const,
};
