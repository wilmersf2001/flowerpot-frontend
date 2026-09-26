import type { ServiceFilters, ServiceListParams } from "./services.types";

/** Fábrica de query-keys de React Query para el módulo de servicios. */
export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (params: ServiceListParams) => [...serviceKeys.lists(), params] as const,
  /** Combobox: list paginado, keyeado por texto. */
  options: (search: string, filters: ServiceFilters = {}) =>
    [...serviceKeys.all, "options", filters, search] as const,
};
