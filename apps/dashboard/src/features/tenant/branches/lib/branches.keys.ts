import { BranchListParams } from "./branches.types";

/** Fábrica de query-keys de React Query para el módulo de sedes. */
export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (params: BranchListParams) => [...branchKeys.lists(), params] as const,
  options: (search: string) => [...branchKeys.all, "options", search] as const,
};
