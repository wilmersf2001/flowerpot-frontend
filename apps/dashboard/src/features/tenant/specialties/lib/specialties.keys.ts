import { SpecialtyListParams } from "./specialties.types";

/** Fábrica de query-keys de React Query para el módulo de especialidades. */
export const specialtyKeys = {
  all: ["specialties"] as const,
  lists: () => [...specialtyKeys.all, "list"] as const,
  list: (params: SpecialtyListParams) => [...specialtyKeys.lists(), params] as const,
  options: (search: string) => [...specialtyKeys.all, "options", search] as const,
};
