import { StaffListParams } from "./staff.types";

/** Fábrica de query-keys de React Query para el módulo de personal. */
export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (params: StaffListParams) => [...staffKeys.lists(), params] as const,
};
