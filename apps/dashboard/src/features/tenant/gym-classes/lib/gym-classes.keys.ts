import { GymClassListParams } from "./gym-classes.types";

/** Fábrica de query-keys de React Query para el módulo de clases (catálogo). */
export const gymClassKeys = {
  all: ["gym-classes"] as const,
  lists: () => [...gymClassKeys.all, "list"] as const,
  list: (params: GymClassListParams) => [...gymClassKeys.lists(), params] as const,
  options: (search: string) => [...gymClassKeys.all, "options", search] as const,
};
