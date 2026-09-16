import { InstructorListParams } from "./instructors.types";

/** Fábrica de query-keys de React Query para el módulo de instructores. */
export const instructorKeys = {
  all: ["instructors"] as const,
  lists: () => [...instructorKeys.all, "list"] as const,
  list: (params: InstructorListParams) => [...instructorKeys.lists(), params] as const,
  options: (search: string) => [...instructorKeys.all, "options", search] as const,
};
