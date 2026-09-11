import { MemberListParams } from "./members.types";

/** Fábrica de query-keys de React Query para el módulo de socios. */
export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (params: MemberListParams) => [...memberKeys.lists(), params] as const,
  options: (search: string) => [...memberKeys.all, "options", search] as const,
};
