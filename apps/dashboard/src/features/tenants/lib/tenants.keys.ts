import type { TenantListParams } from "./tenants.types";

/** Fábrica de query-keys de React Query para el módulo de gimnasios. */
export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (params: TenantListParams) =>
    [...tenantKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string) => [...tenantKeys.all, "options", search] as const,
};
