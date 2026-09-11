import { PlanListParams } from "./plans.types";

/** Fábrica de query-keys de React Query para el módulo de planes. */
export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params: PlanListParams) => [...planKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string) => [...planKeys.all, "options", search] as const,
};
