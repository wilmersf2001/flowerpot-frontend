/** Fábrica de query-keys de React Query para el módulo de gimnasios. */
export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
};
