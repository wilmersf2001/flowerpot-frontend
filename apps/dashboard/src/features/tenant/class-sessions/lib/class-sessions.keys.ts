import { ClassSessionListParams } from "./class-sessions.types";

/** Fábrica de query-keys de React Query para el módulo de sesiones de clase. */
export const classSessionKeys = {
  all: ["class-sessions"] as const,
  lists: () => [...classSessionKeys.all, "list"] as const,
  list: (params: ClassSessionListParams) => [...classSessionKeys.lists(), params] as const,
};
