import { JobPositionListParams } from "./job-positions.types";

/** Fábrica de query-keys de React Query para el módulo de cargos/puestos. */
export const jobPositionKeys = {
  all: ["job-positions"] as const,
  lists: () => [...jobPositionKeys.all, "list"] as const,
  list: (params: JobPositionListParams) => [...jobPositionKeys.lists(), params] as const,
  options: (search: string) => [...jobPositionKeys.all, "options", search] as const,
};
