import { MemberFilters, MemberListParams } from "./members.types";

/** Fábrica de query-keys de React Query para el módulo de socios. */
export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (params: MemberListParams) => [...memberKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string, filters: MemberFilters = {}) =>
    [...memberKeys.all, "options", filters, search] as const,
};
